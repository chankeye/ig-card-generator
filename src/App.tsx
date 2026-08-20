import React, { useRef, useState, useEffect } from 'react';
import { Camera, Download, Image as ImageIcon, Sparkles, Type, Eye } from 'lucide-react';

export default function App() {
  const [word, setWord] = useState('お部屋食\nおへやしょく');
  const [translation, setTranslation] = useState('在房間內用餐、房內供餐');
  const [sentenceJP, setSentenceJP] = useState('旅館でゆっくり過ごしたいから、夕食はお部屋食のプランを選んだよ。\n因為想在旅館裡悠閒地度過，所以晚餐選了在房間內用餐的方案。'); 
  const [themeColor, setThemeColor] = useState('pink');
  const [fontChoice, setFontChoice] = useState<'zen' | 'mplus' | 'noto'>('zen');
  
  // 字體大小控制
  const [wordFontSize, setWordFontSize] = useState(56);
  const [sentenceFontSize, setSentenceFontSize] = useState(42);
  
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [illustrationImage, setIllustrationImage] = useState<string | null>(null);

  const [loadedAvatar, setLoadedAvatar] = useState<HTMLImageElement | null>(null);
  const [loadedIll, setLoadedIll] = useState<HTMLImageElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 監聽 Web Fonts 載入完成，觸發 Canvas 重新繪製
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // 預載圖片以確保 Canvas 能同步渲染
  useEffect(() => {
    if (!avatarImage) {
      setLoadedAvatar(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedAvatar(img);
    img.onerror = () => setLoadedAvatar(null);
    img.src = avatarImage;
  }, [avatarImage]);

  useEffect(() => {
    if (!illustrationImage) {
      setLoadedIll(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedIll(img);
    img.onerror = () => setLoadedIll(null);
    img.src = illustrationImage;
  }, [illustrationImage]);

  // 處理圖片上傳
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setTarget: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setTarget(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const themeColors: Record<string, { bg: string; primary: string; secondary: string; tape: string }> = {
    pink: { bg: '#FDF2F8', primary: '#EC4899', secondary: '#FBCFE8', tape: '#6EE7B7' },
    yellow: { bg: '#FFFBEB', primary: '#F59E0B', secondary: '#FDE68A', tape: '#FCA5A5' },
    blue: { bg: '#EFF6FF', primary: '#3B82F6', secondary: '#BFDBFE', tape: '#FBBF24' },
    mint: { bg: '#F0FDF4', primary: '#10B981', secondary: '#BBF7D0', tape: '#F472B6' },
  };

  const fontFamilies = {
    zen: '"Zen Maru Gothic", "Noto Sans JP", "Noto Sans TC", sans-serif',
    mplus: '"M PLUS Rounded 1c", "Zen Maru Gothic", sans-serif',
    noto: '"Noto Sans JP", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 核心：即時渲染 Canvas (完全比照原版大尺寸拍立得與日系溫潤排版)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = 1080;
    const colors = themeColors[themeColor] || themeColors.pink;
    const font = fontFamilies[fontChoice] || fontFamilies.zen;

    // 1. 清空與圓角大背景
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = colors.bg;
    drawRoundedRect(ctx, 0, 0, S, S, 54);
    ctx.fill();

    // 2. 裝飾背景柔和圓形
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath(); ctx.arc(S * 0.88, S * 0.08, S * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(S * 0.06, S * 0.94, S * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // 3. Header: 大頭照 + 標題與 IG 帳號
    const headerY = 60;
    ctx.save();
    ctx.beginPath(); ctx.arc(110, headerY + 58, 58, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    ctx.beginPath(); ctx.arc(110, headerY + 58, 52, 0, Math.PI * 2); ctx.clip();
    if (loadedAvatar) {
      const imgW = loadedAvatar.width; const imgH = loadedAvatar.height;
      const scale = Math.max(104 / imgW, 104 / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedAvatar, 110 - drawW / 2, headerY + 58 - drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = colors.secondary; ctx.fillRect(58, headerY + 6, 104, 104);
      ctx.fillStyle = '#1f2937'; ctx.font = `900 46px ${font}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('吉', 110, headerY + 58);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    ctx.fillStyle = '#1e293b'; ctx.font = `900 46px ${font}`; ctx.textBaseline = 'middle';
    ctx.fillText('吉武的日文小教室', 188, headerY + 44);
    ctx.fillStyle = '#64748b'; ctx.font = `700 22px ${font}`;
    ctx.fillText('@languagetrailsfree', 188, headerY + 80);

    // 4. 計算底部例句筆記本高度與位置
    ctx.font = `700 ${sentenceFontSize}px ${font}`;
    const maxNoteTextW = 810;
    const wrappedLines: string[] = [];
    for (const oLine of sentenceJP.split('\n')) {
      if (oLine === '') { wrappedLines.push(''); continue; }
      let currentLine = '';
      for (const char of oLine) {
        if (ctx.measureText(currentLine + char).width > maxNoteTextW && currentLine.length > 0) {
          wrappedLines.push(currentLine); currentLine = char;
        } else { currentLine += char; }
      }
      if (currentLine) { wrappedLines.push(currentLine); }
    }
    
    const lineCount = Math.max(2, wrappedLines.length);
    const noteTopPad = 74; 
    const noteBotPad = 32; 
    const lineH = Math.floor(sentenceFontSize * 1.58);
    const noteH = noteTopPad + lineCount * lineH + noteBotPad;
    const noteY = S - noteH - 42; 

    // 5. 中間單字卡區域 (白底半透明大卡片)
    const cardY = 226;
    const cardH = noteY - cardY - 26; 
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, 45, cardY, S - 90, cardH, 44); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
    drawRoundedRect(ctx, 45, cardY, S - 90, cardH, 44); ctx.stroke();

    // 6. 右側大尺寸拍立得相框 (原版大器比例：寬約 390px、高約 430px，自然微突出 card 邊界，立體層次感極佳)
    const polaroidW = 390;
    const polaroidH = 430;
    const polaroidX = S - 45 - polaroidW - 18;
    const polaroidY = cardY + (cardH - polaroidH) / 2 - 12; // 稍微向上微偏，形成經典拼貼感

    ctx.save();
    // 旋轉中心設在拍立得中心，旋轉角度 ~ 2.6 度
    ctx.translate(polaroidX + polaroidW / 2, polaroidY + polaroidH / 2);
    ctx.rotate(0.045);
    ctx.translate(-(polaroidX + polaroidW / 2), -(polaroidY + polaroidH / 2));

    // 拍立得白色厚卡紙與立體陰影
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    drawRoundedRect(ctx, polaroidX, polaroidY, polaroidW, polaroidH, 18); ctx.fill();
    ctx.shadowColor = 'transparent';

    // 相片內部正方形區域 (大尺寸展示)
    const photoPad = 22;
    const photoW = polaroidW - photoPad * 2; // 346px
    const photoH = 346; // 正方形經典照片區
    const photoX = polaroidX + photoPad;
    const photoY = polaroidY + photoPad;
    
    ctx.fillStyle = '#f8fafc';
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10); ctx.fill();

    if (loadedIll) {
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10);
      ctx.clip();
      const imgW = loadedIll.width; const imgH = loadedIll.height;
      const scale = Math.max(photoW / imgW, photoH / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedIll, photoX + (photoW - drawW) / 2, photoY + (photoH - drawH) / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#94a3b8'; ctx.globalAlpha = 0.45; ctx.font = `700 24px ${font}`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText('📷 點擊左側上傳插圖', photoX + photoW / 2, photoY + photoH / 2);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    
    // 右上角斜角紙膠帶 (亮麗吸睛)
    const tapeW = 105;
    const tapeH = 30;
    ctx.fillStyle = colors.tape; ctx.globalAlpha = 0.88; ctx.save();
    ctx.translate(polaroidX + polaroidW - 80, polaroidY - 14); ctx.rotate(0.28);
    drawRoundedRect(ctx, 0, 0, tapeW, tapeH, 5); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
    
    ctx.restore(); // 結束拍立得繪製

    // 7. 左側單字與翻譯排版 (自動適應大拍立得寬度)
    const maxWordW = polaroidX - 110;
    ctx.font = `900 ${wordFontSize}px ${font}`;
    const wordLines: string[] = [];
    for (const wLine of word.split('\n')) {
      let currentLine = '';
      for (const char of wLine) {
        if (ctx.measureText(currentLine + char).width > maxWordW && currentLine.length > 0) {
          wordLines.push(currentLine); currentLine = char;
        } else { currentLine += char; }
      }
      if (currentLine) wordLines.push(currentLine);
    }
    const wordLineH = Math.floor(wordFontSize * 1.28);
    const badgeH = 42; const gapBadgeWord = 14; const wordsH = wordLines.length * wordLineH;
    const gapWordTrans = 24; const transH = 48;
    const totalContentH = badgeH + gapBadgeWord + wordsH + gapWordTrans + transH;
    let currentY = cardY + (cardH - totalContentH) / 2;

    // 「本日の単語」標籤徽章
    const badgeText = '本日の単語';
    ctx.font = `900 23px ${font}`;
    const badgeW = ctx.measureText(badgeText).width + 38;
    ctx.fillStyle = colors.primary;
    drawRoundedRect(ctx, 85, currentY, badgeW, badgeH, badgeH / 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 104, currentY + badgeH / 2);
    currentY += badgeH + gapBadgeWord;

    // 日文單字主體 (漢字 + 假名)
    ctx.fillStyle = '#0f172a'; ctx.font = `900 ${wordFontSize}px ${font}`; ctx.textBaseline = 'top';
    wordLines.forEach((line, idx) => {
      ctx.fillText(line, 85, currentY + idx * wordLineH);
    });
    currentY += wordsH + gapWordTrans;

    // 中文翻譯黑色膠囊
    ctx.font = `700 28px ${font}`;
    const transW = ctx.measureText(translation).width + 36;
    ctx.save();
    ctx.translate(85, currentY); ctx.rotate(-0.025);
    ctx.fillStyle = '#1e293b'; drawRoundedRect(ctx, 0, 0, transW, transH, 12); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(translation, 18, transH / 2);
    ctx.restore();

    // 8. 底部例句筆記本 (微傾斜仿真手帳風格)
    ctx.save();
    ctx.translate(S / 2, noteY + noteH / 2); ctx.rotate(-0.012);
    ctx.translate(-(S / 2), -(noteY + noteH / 2));
    
    // 筆記本白底與陰影
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
    drawRoundedRect(ctx, 45, noteY, S - 90, noteH, 38); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 2.5; drawRoundedRect(ctx, 45, noteY, S - 90, noteH, 38); ctx.stroke();
    
    // 筆記本紅色左側邊界線
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(140, noteY + 12); ctx.lineTo(140, noteY + noteH - 12); ctx.stroke();
    
    // 星星與標籤
    ctx.fillStyle = '#F59E0B'; ctx.font = `900 24px ${font}`; ctx.textBaseline = 'top'; ctx.fillText('★', 160, noteY + 22);
    ctx.fillStyle = '#64748b'; ctx.font = `900 22px ${font}`; ctx.fillText('例文（例句）', 190, noteY + 24);
    
    // 繪製橫線與文字
    ctx.font = `700 ${sentenceFontSize}px ${font}`; 
    wrappedLines.forEach((line, i) => {
      const ly = noteY + noteTopPad + i * lineH;
      // 筆記藍灰橫線
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(160, ly + lineH); ctx.lineTo(S - 80, ly + lineH); ctx.stroke();
      
      // 文字
      ctx.fillStyle = '#0f172a';
      ctx.textBaseline = 'middle';
      ctx.fillText(line, 160, ly + lineH / 2);
    });
    ctx.restore();

  }, [word, translation, sentenceJP, themeColor, fontChoice, fontsLoaded, loadedAvatar, loadedIll, wordFontSize, sentenceFontSize]);

  // 瞬間下載
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `吉武日文小教室_${word.split('\n')[0]}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-4 px-3 sm:p-6 lg:p-8 flex justify-center items-start overflow-x-hidden font-sans">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
        
        {/* 控制面板 */}
        <div className="w-full max-w-lg bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-4 border border-gray-100 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
              <Sparkles className="text-pink-500" size={22} />
              全能彈性編輯器
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full">
              IG 1:1 貼文規格
            </span>
          </div>
          
          {/* 上傳按鈕區 */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 text-blue-700 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1 transition-all shadow-sm text-center">
              <Camera size={18} />
              <span className="text-xs sm:text-sm font-bold">預覽大頭照</span>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setAvatarImage)} className="hidden" />
            </label>
            <label className="cursor-pointer bg-pink-50 hover:bg-pink-100 active:scale-95 border border-pink-200 text-pink-700 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1 transition-all shadow-sm text-center">
              <ImageIcon size={18} />
              <span className="text-xs sm:text-sm font-bold">上傳單字插圖</span>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setIllustrationImage)} className="hidden" />
            </label>
          </div>

          {/* 字體風格選擇 */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Type size={15} className="text-gray-500" />
              日文字體風格
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { id: 'zen', name: '日系圓體', desc: 'Zen Maru (推薦)' },
                { id: 'mplus', name: '可愛萌圓', desc: 'M PLUS' },
                { id: 'noto', name: '清晰黑體', desc: 'Noto Sans' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontChoice(f.id as any)}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    fontChoice === f.id
                      ? 'border-gray-800 bg-gray-900 text-white shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{f.name}</div>
                  <div className={`text-[10px] mt-0.5 ${fontChoice === f.id ? 'text-gray-300' : 'text-gray-400'}`}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 顏色與單字字體大小 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">背景主題色</label>
              <div className="flex gap-2">
                {Object.keys(themeColors).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm transition-all border-2 ${themeColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: themeColors[color].primary }}
                    aria-label={`選擇 ${color} 主題色`}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs sm:text-sm font-bold text-gray-700">單字大小</label>
                <span className="text-xs text-gray-500 font-bold">{wordFontSize}px</span>
              </div>
              <input type="range" min="36" max="96" value={wordFontSize} onChange={e => setWordFontSize(Number(e.target.value))} className="w-full accent-gray-800" />
            </div>
          </div>

          {/* 例句大小 */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs sm:text-sm font-bold text-gray-700">例句字體大小</label>
              <span className="text-xs text-gray-500 font-bold">{sentenceFontSize}px</span>
            </div>
            <input type="range" min="24" max="64" value={sentenceFontSize} onChange={e => setSentenceFontSize(Number(e.target.value))} className="w-full accent-gray-800" />
          </div>

          {/* 文字輸入 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">日文單字</label>
              <textarea value={word} onChange={e => setWord(e.target.value)} rows={2} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none resize-none leading-relaxed transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">中文翻譯</label>
              <input type="text" value={translation} onChange={e => setTranslation(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none transition-colors text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">日文例句</label>
            <textarea value={sentenceJP} onChange={e => setSentenceJP(e.target.value)} rows={3} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none resize-none leading-relaxed transition-colors text-sm" />
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full mt-1 bg-gray-900 hover:bg-black active:scale-[0.98] text-white rounded-xl p-3 sm:p-3.5 font-black flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Download size={19} />
            一鍵下載為 IG 貼文 (1080x1080)
          </button>
        </div>

        {/* 右側（手機版在上方）：自適應縮放 Canvas 預覽區 */}
        <div className="w-full max-w-lg flex flex-col items-center gap-2 order-1 lg:order-2">
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <Eye size={14} /> 即時畫布預覽
            </span>
            <span className="text-[11px] font-semibold text-gray-400">1080 × 1080 px</span>
          </div>
          
          <div className="w-full aspect-square bg-gray-200 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl border-4 sm:border-[6px] border-white relative flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              width={1080} 
              height={1080} 
              className="w-full h-full object-contain block" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
