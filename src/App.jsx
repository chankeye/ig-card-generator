import { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Trash2, 
  Upload, 
  SlidersHorizontal, 
  Image as ImageIcon,
  Camera,
  ZoomIn,
  Palette,
  Type
} from 'lucide-react';
import './App.css';

// Preset sample data
const SAMPLES = {
  noriben: {
    raw: `・のり弁（のりべん）：海苔便當\n金欠のときは、白身魚フライがのった安くてうまいのり弁しか勝たん！\n月底吃土的時候，果然只有鋪上炸白身魚排、便宜又好吃的海苔便當最無敵！`,
    image: '/samples/noriben.jpg'
  },
  oheyashoku: {
    raw: `・お部屋食（おへやしょく）：在房間內用餐、房內供餐\n旅館でゆっくり過ごしたいから、夕食はお部屋食のプランを選んだよ。\n因為想在旅館裡悠閒地度過，所以晚餐選了在房間內用餐的方案。`,
    image: '/samples/oheyashoku.jpg'
  }
};

// 4 Color Themes (櫻花粉、暖陽黃、薄荷綠、晴空藍)
const THEMES = [
  {
    id: 'pink',
    name: '櫻花粉',
    hex: '#e04b7e',
    badgeBg: '#e04b7e',
    blob1: '#fde2ec',
    blob2: '#fce7ef',
    avatarBg: '#f5d6e2',
    marginLine: '#fca5a5',
    cardBg: 'linear-gradient(135deg, #fffafd 0%, #fff7f9 50%, #fdf5f8 100%)',
    tapeBg: 'rgba(134, 239, 172, 0.85)'
  },
  {
    id: 'yellow',
    name: '暖陽黃',
    hex: '#f59e0b',
    badgeBg: '#ea580c',
    blob1: '#fef3c7',
    blob2: '#ffedd5',
    avatarBg: '#fde68a',
    marginLine: '#fcd34d',
    cardBg: 'linear-gradient(135deg, #fffdf8 0%, #fffbeb 50%, #fef9ed 100%)',
    tapeBg: 'rgba(253, 224, 71, 0.85)'
  },
  {
    id: 'green',
    name: '薄荷綠',
    hex: '#10b981',
    badgeBg: '#059669',
    blob1: '#d1fae5',
    blob2: '#ccfbf1',
    avatarBg: '#a7f3d0',
    marginLine: '#6ee7b7',
    cardBg: 'linear-gradient(135deg, #fafffc 0%, #f0fdf4 50%, #ecfdf5 100%)',
    tapeBg: 'rgba(110, 231, 183, 0.85)'
  },
  {
    id: 'blue',
    name: '晴空藍',
    hex: '#3b82f6',
    badgeBg: '#2563eb',
    blob1: '#dbeafe',
    blob2: '#e0e7ff',
    avatarBg: '#bfdbfe',
    marginLine: '#93c5fd',
    cardBg: 'linear-gradient(135deg, #fafcff 0%, #eff6ff 50%, #eef2ff 100%)',
    tapeBg: 'rgba(147, 197, 253, 0.85)'
  }
];

/**
 * Parses user input according to the specification:
 * ・日文單字（日文發音）：中文翻譯
 * 日文例句
 * 中文例句
 */
function parseCardInput(text) {
  if (!text || !text.trim()) {
    return {
      word: '',
      reading: '',
      translation: '',
      jpSentence: '',
      zhSentence: ''
    };
  }

  // Split lines and trim, removing blank lines
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { word: '', reading: '', translation: '', jpSentence: '', zhSentence: '' };
  }

  // Line 1: ・日文單字（日文發音）：中文翻譯
  const line1 = lines[0];
  // Remove leading bullet/dots/dashes/numbers: ・, •, *, -, 1., etc.
  const cleanLine1 = line1.replace(/^[\s・•*·\-–—\d.]+\s*/, '');

  let wordPart = cleanLine1;
  let translation = '';

  // Split at first colon (fullwidth ： or halfwidth :)
  const colonIndex = cleanLine1.search(/[:：]/);
  if (colonIndex !== -1) {
    wordPart = cleanLine1.slice(0, colonIndex).trim();
    translation = cleanLine1.slice(colonIndex + 1).trim();
  }

  // Extract reading from parentheses: （...） or (...) or 【...】 or [...]
  let word = wordPart;
  let reading = '';
  const parenMatch = wordPart.match(/^(.+?)[（(【[](.*)[）)】\]]$/);
  if (parenMatch) {
    word = parenMatch[1].trim();
    reading = parenMatch[2].trim();
  }

  // Line 2: 日文例句
  const jpSentence = lines[1] || '';

  // Line 3+: 中文例句
  const zhSentence = lines.slice(2).join('\n') || '';

  return { word, reading, translation, jpSentence, zhSentence };
}

/**
 * Reconstructs the fixed-format string from parsed components
 */
function formatCardInput(parsed) {
  const { word, reading, translation, jpSentence, zhSentence } = parsed;
  const wordWithReading = reading ? `${word}（${reading}）` : word;
  const line1 = `・${wordWithReading}：${translation}`;
  return [line1, jpSentence, zhSentence].filter(Boolean).join('\n');
}

export default function App() {
  // Main fixed-format input state
  const [rawInput, setRawInput] = useState(SAMPLES.noriben.raw);
  
  // Parsed state
  const [parsedData, setParsedData] = useState(() => parseCardInput(SAMPLES.noriben.raw));

  // Visual options
  const [selectedThemeId, setSelectedThemeId] = useState('pink'); // pink | yellow | green | blue
  const [readingPosition, setReadingPosition] = useState('above'); // 'above' (ruby on top) | 'below' (under word)
  const [photoUrl, setPhotoUrl] = useState(SAMPLES.noriben.image);
  const [photoSize, setPhotoSize] = useState(235); // in px (180 ~ 280)
  const [wordSize, setWordSize] = useState(40); // in px (28 ~ 56)
  const [sentenceSize, setSentenceSize] = useState(20); // in px (14 ~ 30, enlarged for mobile legibility)
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' | '4:5'
  
  // Brand & Avatar metadata
  const [avatarUrl, setAvatarUrl] = useState(''); // Uploaded avatar picture
  const [brandTitle, setBrandTitle] = useState('吉武的日文小教室');
  const [brandHandle, setBrandHandle] = useState('@languagetrailsfree');
  const [avatarText, setAvatarText] = useState('吉');
  const [tagText, setTagText] = useState('本日の単語');

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const cardRef = useRef(null);
  const stageRef = useRef(null);
  const [stageScale, setStageScale] = useState(1);
  const fileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const currentTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];
  const sentenceLineHeight = Math.round(sentenceSize * 1.68 * 10) / 10;

  // Responsively scale card to fit mobile screens perfectly
  useEffect(() => {
    const updateScale = () => {
      if (!stageRef.current) return;
      const availableWidth = stageRef.current.clientWidth - 24;
      if (availableWidth > 0 && availableWidth < 580) {
        setStageScale(availableWidth / 580);
      } else {
        setStageScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      observer = new ResizeObserver(updateScale);
      observer.observe(stageRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateScale);
      if (observer) observer.disconnect();
    };
  }, []);

  // Sync parsing when rawInput changes
  const handleRawInputChange = (newText) => {
    setRawInput(newText);
    setParsedData(parseCardInput(newText));
  };

  // Sync raw input when individual fields are edited in advanced mode
  const handleFieldChange = (field, value) => {
    const updated = { ...parsedData, [field]: value };
    setParsedData(updated);
    setRawInput(formatCardInput(updated));
  };

  // Handle polaroid photo upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar photo upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Support pasting image anywhere
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (event) => {
                setPhotoUrl(event.target.result);
              };
              reader.readAsDataURL(blob);
              break;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Export card as high-res PNG (with skipFonts: true to prevent SecurityError)
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2.5,
        skipFonts: true,
        cacheBust: false,
      });
      const link = document.createElement('a');
      const filename = `${parsedData.word || '日文單字'}_IG單字卡.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('圖片導出遇到問題，請稍候重試。');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy card image to clipboard
  const handleCopyClipboard = async () => {
    if (!cardRef.current) return;
    try {
      setIsCopying(true);
      const blob = await htmlToImage.toBlob(cardRef.current, {
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: false,
      });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      alert('您的瀏覽器不支援直接複製圖片到剪貼簿，請點擊「下載 IG 圖卡 (PNG)」。');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="app-container">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/*"
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
      />

      {/* Header Bar */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-badge">IG</div>
          <div>
            <h1 className="app-title">日文單字卡製作器</h1>
            <p className="app-subtitle">固定格式自動拆分・一鍵生成高畫質社群圖卡</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="action-btn secondary-btn"
            onClick={handleCopyClipboard}
            disabled={isCopying}
          >
            {copiedSuccess ? <Check size={18} className="text-green" /> : <Copy size={18} />}
            <span>{copiedSuccess ? '已複製到剪貼簿！' : '複製圖片'}</span>
          </button>
          <button 
            type="button" 
            className="action-btn primary-btn"
            onClick={handleDownload}
            disabled={isExporting}
          >
            <Download size={18} />
            <span>{isExporting ? '生成高畫質中...' : '下載 IG 圖卡 (PNG)'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="app-main">
        {/* Left: Input & Editor Panel */}
        <section className="editor-panel">
          {/* Card 1: Fast Input */}
          <div className="panel-card">
            <div className="panel-card-header">
              <div className="panel-card-title">
                <Sparkles size={18} className="text-primary" />
                <h2>固定格式快速輸入</h2>
              </div>
              <div className="sample-buttons">
                <button 
                  type="button" 
                  className="chip-btn"
                  onClick={() => {
                    setRawInput(SAMPLES.noriben.raw);
                    setParsedData(parseCardInput(SAMPLES.noriben.raw));
                    setPhotoUrl(SAMPLES.noriben.image);
                  }}
                >
                  範例：のり弁
                </button>
                <button 
                  type="button" 
                  className="chip-btn"
                  onClick={() => {
                    setRawInput(SAMPLES.oheyashoku.raw);
                    setParsedData(parseCardInput(SAMPLES.oheyashoku.raw));
                    setPhotoUrl(SAMPLES.oheyashoku.image);
                  }}
                >
                  範例：お部屋食
                </button>
                <button 
                  type="button" 
                  className="chip-btn text-muted"
                  onClick={() => handleRawInputChange('')}
                >
                  <Trash2 size={13} />
                  清空
                </button>
              </div>
            </div>

            <div className="format-hint">
              <span className="hint-label">格式規範：</span>
              <code>・日文單字（日文發音）：中文翻譯</code>
              <code>日文例句</code>
              <code>中文例句</code>
            </div>

            <textarea
              id="raw-input-textarea"
              className="raw-textarea"
              value={rawInput}
              onChange={(e) => handleRawInputChange(e.target.value)}
              placeholder="請直接貼上固定格式內容，例如：&#10;・のり弁（のりべん）：海苔便當&#10;金欠のときは、白身魚フライがのった安くてうまいのり弁しか勝たん！&#10;月底吃土的時候，果然只有鋪上炸白身魚排、便宜又好吃的海苔便當最無敵！"
              rows={5}
            />

            {/* Quick Live Parse Breakdown */}
            <div className="parse-status-bar">
              <div className="status-item">
                <span className="status-label">單字</span>
                <strong className="status-val">{parsedData.word || '—'}</strong>
              </div>
              <div className="status-item">
                <span className="status-label">發音</span>
                <strong className="status-val">{parsedData.reading || '—'}</strong>
              </div>
              <div className="status-item">
                <span className="status-label">翻譯</span>
                <strong className="status-val truncate">{parsedData.translation || '—'}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: 4 Color Themes (主題顏色切換) */}
          <div className="panel-card">
            <div className="panel-card-title theme-header">
              <Palette size={17} className="text-primary" />
              <h3 className="section-title no-margin">卡片主題顏色 (4 色)</h3>
            </div>
            <div className="theme-picker-grid">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-card-btn ${selectedThemeId === theme.id ? 'active' : ''}`}
                  onClick={() => setSelectedThemeId(theme.id)}
                >
                  <span 
                    className="theme-swatch-dot" 
                    style={{ backgroundColor: theme.hex }}
                  />
                  <span className="theme-name">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Avatar & Brand Section (大頭照上傳與品牌) */}
          <div className="panel-card">
            <h3 className="section-title">大頭照與頻道品牌</h3>
            <div className="avatar-control-box">
              <div 
                className="avatar-preview-wrapper"
                onClick={() => avatarFileInputRef.current?.click()}
                title="點擊上傳大頭照"
                style={{ borderColor: currentTheme.hex }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="大頭照預覽" className="avatar-preview-img" />
                ) : (
                  <div 
                    className="avatar-preview-fallback"
                    style={{ backgroundColor: currentTheme.avatarBg }}
                  >
                    {avatarText}
                  </div>
                )}
                <div className="avatar-preview-overlay">
                  <Camera size={16} />
                </div>
              </div>

              <div className="avatar-actions">
                <div className="avatar-btn-row">
                  <button
                    type="button"
                    className="upload-btn primary-outline"
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    {avatarUrl ? '更換大頭照' : '上傳大頭照'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      className="clear-photo-btn"
                      onClick={() => setAvatarUrl('')}
                    >
                      <Trash2 size={14} />
                      移除照片
                    </button>
                  )}
                </div>
                <p className="avatar-tip">支援 JPG、PNG 圖片。未上傳時將顯示文字頭像「{avatarText}」</p>
              </div>
            </div>

            <div className="brand-inputs-row">
              <div className="field-item">
                <label>頻道名稱</label>
                <input
                  type="text"
                  value={brandTitle}
                  onChange={(e) => setBrandTitle(e.target.value)}
                />
              </div>
              <div className="field-item">
                <label>社群帳號</label>
                <input
                  type="text"
                  value={brandHandle}
                  onChange={(e) => setBrandHandle(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card: Font Sizes (單字與例句大小) */}
          <div className="panel-card">
            <div className="panel-card-title theme-header">
              <Type size={17} className="text-primary" />
              <h3 className="section-title no-margin">單字與例句大小調整</h3>
            </div>
            
            <div className="font-size-controls-stack">
              {/* Word Size */}
              <div className="photo-size-control no-margin-top">
                <div className="size-label-row">
                  <span className="control-sublabel">
                    <Type size={14} /> 單字字體大小：<strong>{wordSize}px</strong>
                  </span>
                  <div className="size-presets">
                    <button 
                      type="button" 
                      className={`size-chip ${wordSize === 32 ? 'active' : ''}`}
                      onClick={() => setWordSize(32)}
                    >
                      小 (32px)
                    </button>
                    <button 
                      type="button" 
                      className={`size-chip ${wordSize === 40 ? 'active' : ''}`}
                      onClick={() => setWordSize(40)}
                    >
                      標準 (40px)
                    </button>
                    <button 
                      type="button" 
                      className={`size-chip ${wordSize === 48 ? 'active' : ''}`}
                      onClick={() => setWordSize(48)}
                    >
                      大 (48px)
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="28"
                  max="56"
                  step="1"
                  value={wordSize}
                  onChange={(e) => setWordSize(Number(e.target.value))}
                  className="size-slider"
                />
              </div>

              {/* Sentence Size */}
              <div className="photo-size-control">
                <div className="size-label-row">
                  <span className="control-sublabel">
                    <Type size={14} /> 例句字體大小：<strong>{sentenceSize}px</strong>
                  </span>
                  <div className="size-presets">
                    <button 
                      type="button" 
                      className={`size-chip ${sentenceSize === 17 ? 'active' : ''}`}
                      onClick={() => setSentenceSize(17)}
                    >
                      小 (17px)
                    </button>
                    <button 
                      type="button" 
                      className={`size-chip ${sentenceSize === 20 ? 'active' : ''}`}
                      onClick={() => setSentenceSize(20)}
                    >
                      標準 (20px)
                    </button>
                    <button 
                      type="button" 
                      className={`size-chip ${sentenceSize === 23 ? 'active' : ''}`}
                      onClick={() => setSentenceSize(23)}
                    >
                      大 (23px)
                    </button>
                    <button 
                      type="button" 
                      className={`size-chip ${sentenceSize === 26 ? 'active' : ''}`}
                      onClick={() => setSentenceSize(26)}
                    >
                      特大 (26px)
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="14"
                  max="30"
                  step="0.5"
                  value={sentenceSize}
                  onChange={(e) => setSentenceSize(Number(e.target.value))}
                  className="size-slider"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Photo Size & Layout Controls (插圖大小與排版) */}
          <div className="panel-card">
            <h3 className="section-title">拍立得插圖與排版</h3>
            
            <div className="controls-grid">
              {/* Photo Upload & Quick Size */}
              <div className="control-group full-width">
                <div className="label-with-action">
                  <label className="control-label">拍立得插圖</label>
                  {photoUrl && (
                    <button
                      type="button"
                      className="clear-photo-btn"
                      onClick={() => setPhotoUrl('')}
                    >
                      <Trash2 size={13} />
                      移除插圖
                    </button>
                  )}
                </div>
                <div className="photo-upload-row">
                  <button 
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    {photoUrl ? '更換插圖' : '上傳插圖'}
                  </button>
                  <span className="upload-tip">支援點擊、拖曳或在頁面直接按 Ctrl+V 貼上</span>
                </div>

                {/* Photo Size Slider / Buttons */}
                <div className="photo-size-control">
                  <div className="size-label-row">
                    <span className="control-sublabel">
                      <ZoomIn size={14} /> 圖片顯示大小：<strong>{photoSize}px</strong>
                    </span>
                    <div className="size-presets">
                      <button 
                        type="button" 
                        className={`size-chip ${photoSize === 200 ? 'active' : ''}`}
                        onClick={() => setPhotoSize(200)}
                      >
                        標準 (200px)
                      </button>
                      <button 
                        type="button" 
                        className={`size-chip ${photoSize === 235 ? 'active' : ''}`}
                        onClick={() => setPhotoSize(235)}
                      >
                        放大 (235px)
                      </button>
                      <button 
                        type="button" 
                        className={`size-chip ${photoSize === 260 ? 'active' : ''}`}
                        onClick={() => setPhotoSize(260)}
                      >
                        特大 (260px)
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="180"
                    max="280"
                    step="5"
                    value={photoSize}
                    onChange={(e) => setPhotoSize(Number(e.target.value))}
                    className="size-slider"
                  />
                </div>
              </div>

              {/* Pronunciation Position */}
              <div className="control-group">
                <label className="control-label">日文發音標示位置</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-option ${readingPosition === 'above' ? 'active' : ''}`}
                    onClick={() => setReadingPosition('above')}
                  >
                    標在單字正上方 (振假名)
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${readingPosition === 'below' ? 'active' : ''}`}
                    onClick={() => setReadingPosition('below')}
                  >
                    標在單字下方
                  </button>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="control-group">
                <label className="control-label">圖片尺寸比例</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-option ${aspectRatio === '1:1' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('1:1')}
                  >
                    1 : 1 (正方形貼文)
                  </button>
                  <button
                    type="button"
                    className={`toggle-option ${aspectRatio === '4:5' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('4:5')}
                  >
                    4 : 5 (滿版直式貼文)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Advanced / Fine-tune Accordion */}
          <div className="panel-card">
            <button
              type="button"
              className="accordion-header"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="accordion-title">
                <SlidersHorizontal size={16} />
                <span>微調各欄位文字與標籤設定</span>
              </div>
              <span className="accordion-chevron">{showAdvanced ? '收合 ▲' : '展開 ▼'}</span>
            </button>

            {showAdvanced && (
              <div className="accordion-body">
                <div className="field-grid">
                  <div className="field-item">
                    <label>日文單字</label>
                    <input
                      type="text"
                      value={parsedData.word}
                      onChange={(e) => handleFieldChange('word', e.target.value)}
                    />
                  </div>
                  <div className="field-item">
                    <label>日文發音（標在單字上）</label>
                    <input
                      type="text"
                      value={parsedData.reading}
                      onChange={(e) => handleFieldChange('reading', e.target.value)}
                    />
                  </div>
                  <div className="field-item full">
                    <label>中文翻譯</label>
                    <input
                      type="text"
                      value={parsedData.translation}
                      onChange={(e) => handleFieldChange('translation', e.target.value)}
                    />
                  </div>
                  <div className="field-item full">
                    <label>日文例句</label>
                    <textarea
                      rows={2}
                      value={parsedData.jpSentence}
                      onChange={(e) => handleFieldChange('jpSentence', e.target.value)}
                    />
                  </div>
                  <div className="field-item full">
                    <label>中文例句</label>
                    <textarea
                      rows={2}
                      value={parsedData.zhSentence}
                      onChange={(e) => handleFieldChange('zhSentence', e.target.value)}
                    />
                  </div>
                  <div className="field-item">
                    <label>文字頭像備用字</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={avatarText}
                      onChange={(e) => setAvatarText(e.target.value)}
                    />
                  </div>
                  <div className="field-item">
                    <label>分類標籤</label>
                    <input
                      type="text"
                      value={tagText}
                      onChange={(e) => setTagText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right: Live Preview */}
        <section className="preview-panel">
          <div className="preview-header">
            <h3 className="preview-title">卡片即時預覽 (WYSIWYG)</h3>
            <span className="preview-spec-badge">Instagram 1080px 高清規格</span>
          </div>

          <div className="card-stage" ref={stageRef}>
            <div 
              className="card-scale-container"
              style={{
                width: `${Math.round(580 * stageScale)}px`,
                height: `${Math.round((aspectRatio === '4:5' ? 725 : 580) * stageScale)}px`,
              }}
            >
              <div 
                className="card-scale-inner"
                style={{
                  transform: `scale(${stageScale})`,
                  transformOrigin: 'top left',
                  width: '580px',
                  height: aspectRatio === '4:5' ? '725px' : '580px',
                }}
              >
                {/* The Actual Rendered Card */}
                <div 
                  ref={cardRef} 
                  className={`ig-card aspect-${aspectRatio.replace(':', '-')}`}
                  id="exportable-ig-card"
              style={{
                background: currentTheme.cardBg,
                '--theme-primary': currentTheme.hex,
                '--theme-badge': currentTheme.badgeBg,
                '--theme-margin': currentTheme.marginLine,
                '--theme-avatar': currentTheme.avatarBg,
                '--theme-tape': currentTheme.tapeBg
              }}
            >
              {/* Soft decorative background pastel shapes */}
              <div 
                className="card-bg-blob blob-top-right"
                style={{
                  background: `radial-gradient(circle, ${currentTheme.blob1} 0%, rgba(255,255,255,0) 70%)`
                }}
              ></div>
              <div 
                className="card-bg-blob blob-bottom-left"
                style={{
                  background: `radial-gradient(circle, ${currentTheme.blob2} 0%, rgba(255,255,255,0) 70%)`
                }}
              ></div>

              {/* Card Header */}
              <header className="card-header">
                <div 
                  className={`card-avatar ${avatarUrl ? 'has-image' : ''}`}
                  onClick={() => avatarFileInputRef.current?.click()}
                  title="點擊更換大頭照"
                  style={{ backgroundColor: currentTheme.avatarBg }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="大頭照" className="card-avatar-img" />
                  ) : (
                    <span>{avatarText}</span>
                  )}
                  <div className="avatar-hover-hint">
                    <Camera size={14} />
                  </div>
                </div>
                <div className="card-brand-info">
                  <h2 className="card-brand-title">{brandTitle}</h2>
                  <p className="card-brand-handle">{brandHandle}</p>
                </div>
              </header>

              {/* Card Middle: Vocab + Large Polaroid */}
              <div className="card-middle-grid">
                {/* Left Vocab Section */}
                <div className="vocab-section">
                  <div 
                    className="vocab-badge"
                    style={{ backgroundColor: currentTheme.badgeBg }}
                  >
                    {tagText}
                  </div>

                  {/* Japanese Word & Reading Display */}
                  <div className={`vocab-word-box position-${readingPosition}`}>
                    {readingPosition === 'above' ? (
                      <ruby className="vocab-ruby">
                        <span className="vocab-kanji" style={{ fontSize: `${wordSize}px` }}>
                          {parsedData.word || '単語'}
                        </span>
                        <rt 
                          className="vocab-furigana" 
                          style={{ fontSize: `${Math.round(wordSize * 0.45)}px` }}
                        >
                          {parsedData.reading || ''}
                        </rt>
                      </ruby>
                    ) : (
                      <div className="vocab-stacked">
                        <span className="vocab-kanji" style={{ fontSize: `${wordSize}px` }}>
                          {parsedData.word || '単語'}
                        </span>
                        {parsedData.reading && (
                          <span 
                            className="vocab-reading-below"
                            style={{ fontSize: `${Math.round(wordSize * 0.65)}px` }}
                          >
                            {parsedData.reading}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chinese Translation Badge */}
                  <div className="translation-badge">
                    <span>{parsedData.translation || '中文翻譯'}</span>
                  </div>
                </div>

                {/* Right Polaroid Photo Section (Bigger Size!) */}
                <div className="polaroid-wrapper">
                  <div 
                    className="polaroid-card"
                    onClick={() => fileInputRef.current?.click()}
                    title="點擊更換插圖"
                  >
                    {/* Washi Masking Tape on Top Right with Theme Color */}
                    <div 
                      className="washi-tape"
                      style={{ background: currentTheme.tapeBg }}
                    ></div>

                    {/* Photo Inner Container with Dynamic Size */}
                    <div 
                      className="polaroid-photo"
                      style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
                    >
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt="插圖" 
                          className="polaroid-img"
                          crossOrigin="anonymous" 
                        />
                      ) : (
                        <div className="polaroid-placeholder">
                          <ImageIcon size={36} className="placeholder-icon" />
                          <span>點擊上傳插圖</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Ruled Notebook Example Sentences */}
              <div className="example-card">
                <div className="example-header">
                  <span className="star-icon">★</span>
                  <span className="example-title">例文（例句）</span>
                </div>

                <div 
                  className="notebook-content"
                  style={{ 
                    borderLeftColor: currentTheme.marginLine,
                    backgroundImage: `repeating-linear-gradient(
                      transparent,
                      transparent ${sentenceLineHeight - 1.5}px,
                      #e9eef5 ${sentenceLineHeight - 1.5}px,
                      #e9eef5 ${sentenceLineHeight}px
                    )`
                  }}
                >
                  {/* Japanese Example Sentence */}
                  <p 
                    className="sentence-jp"
                    style={{ 
                      fontSize: `${sentenceSize}px`,
                      lineHeight: `${sentenceLineHeight}px`
                    }}
                  >
                    {parsedData.jpSentence || '日文例句將自動顯示於此處。'}
                  </p>
                  {/* Chinese Translation Sentence */}
                  <p 
                    className="sentence-zh"
                    style={{ 
                      fontSize: `${Math.max(13, sentenceSize - 2.5)}px`,
                      lineHeight: `${sentenceLineHeight}px`
                    }}
                  >
                    {parsedData.zhSentence || '中文例句將自動顯示於此處。'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      </main>
    </div>
  );
}
