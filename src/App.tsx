import React, { useRef, useState, useEffect } from 'react';
import { Camera, Download, Image as ImageIcon, Sparkles, Type } from 'lucide-react';

export default function App() {
  const [word, setWord] = useState('引きこもり\n(引きこもり)');
  const [translation, setTranslation] = useState('宅在家、不出門的人');
  const [sentenceJP, setSentenceJP] = useState('連休は一歩も外に出ず、完全な引きこもり生活を送りました。\n連休は一歩も外に出ず、完全な引きこもり生活を送りました。'); 
  const [themeColor, setThemeColor] = useState('yellow');
  const [fontChoice, setFontChoice] = useState<'zen' | 'noto' | 'mplus'>('zen');
  
  // 字體大小控制
  const [wordFontSize, setWordFontSize] = useState(56);
  const [sentenceFontSize, setSentenceFontSize] = useState(44);
  
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
    yellow: { bg: '#FFFBEB', primary: '#FBBF24', secondary: '#FDE68A', tape: '#FCA5A5' },
    blue: { bg: '#EFF6FF', primary: '#60A5FA', secondary: '#BFDBFE', tape: '#FBBF24' },
    pink: { bg: '#FDF2F8', primary: '#F472B6', secondary: '#FBCFE8', tape: '#6EE7B7' },
    mint: { bg: '#F0FDF4', primary: '#4ADE80', secondary: '#BBF7D0', tape: '#F472B6' },
  };

  const fontFamilies = {
    zen: '"Zen Maru Gothic", "Noto Sans JP", "Noto Sans TC", sans-serif',
    noto: '"Noto Sans JP", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
    mplus: '"M PLUS Rounded 1c", "Zen Maru Gothic", sans-serif',
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

  // 核心：即時渲染 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = 1080;
    const colors = themeColors[themeColor] || themeColors.yellow;
    const font = fontFamilies[fontChoice] || fontFamilies.zen;

    // 1. 清空與圓角背景
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = colors.bg;
    drawRoundedRect(ctx, 0, 0, S, S, 60);
    ctx.fill();

    // 2. 裝飾圓形（日系粉彩漸層點綴）
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath(); ctx.arc(S * 0.85, S * 0.05, S * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(S * 0.08, S * 0.95, S * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // 3. Header: 大頭照 + 頻道名稱
    const headerY = 65;
    ctx.save();
    ctx.beginPath(); ctx.arc(110, headerY + 56, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    ctx.beginPath(); ctx.arc(110, headerY + 56, 50, 0, Math.PI * 2); ctx.clip();
    if (loadedAvatar) {
      const imgW = loadedAvatar.width; const imgH = loadedAvatar.height;
      const scale = Math.max(100 / imgW, 100 / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedAvatar, 110 - drawW / 2, headerY + 56 - drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = colors.secondary; ctx.fillRect(60, headerY + 6, 100, 100);
      ctx.fillStyle = '#1f2937'; ctx.font = `900 44px ${font}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('吉', 110, headerY + 56);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    ctx.fillStyle = '#1f2937'; ctx.font = `900 44px ${font}`; ctx.textBaseline = 'middle';
    ctx.fillText('吉武的日文小教室', 185, headerY + 42);
    ctx.fillStyle = '#6b7280'; ctx.font = `700 20px ${font}`;
    ctx.fillText('@languagetrailsfree', 185, headerY + 78);

    // 4. 計算例句區域高度 (動態伸縮)
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
    const noteTopPad = 72; 
    const noteBotPad = 32; 
    const lineH = Math.floor(sentenceFontSize * 1.6);
    const noteH = noteTopPad + lineCount * lineH + noteBotPad;
    const noteY = S - noteH - 45; 

    // 5. 中間單字卡區域
    const cardY = 220;
    const cardH = noteY - cardY - 26; 
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    drawRoundedRect(ctx, 45, cardY, S - 90, cardH, 44); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
    drawRoundedRect(ctx, 45, cardY, S - 90, cardH, 44); ctx.stroke();

    // 6. 右側拍立得相框 (動態依 cardH 調整大小，確保完美收納於卡片內)
    const targetPolaroidH = Math.min(360, Math.max(240, cardH - 40));
    const polaroidH = targetPolaroidH;
    const polaroidW = Math.round(polaroidH * 0.88);
    const polaroidX = S - 45 - polaroidW - 32;
    const polaroidY = cardY + (cardH - polaroidH) / 2;

    ctx.save();
    // 溫和旋轉，旋轉中心設在拍立得中心
    ctx.translate(polaroidX + polaroidW / 2, polaroidY + polaroidH / 2);
    ctx.rotate(0.025);
    ctx.translate(-(polaroidX + polaroidW / 2), -(polaroidY + polaroidH / 2));

    // 拍立得白色卡紙
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
    drawRoundedRect(ctx, polaroidX, polaroidY, polaroidW, polaroidH, 16); ctx.fill();
    ctx.shadowColor = 'transparent';

    // 相片內部區域
    const photoPad = Math.round(polaroidW * 0.055);
    const photoW = polaroidW - photoPad * 2;
    const photoH = polaroidH - photoPad * 2 - Math.round(polaroidH * 0.14); // 底部保留拍立得經典白邊
    const photoX = polaroidX + photoPad;
    const photoY = polaroidY + photoPad;
    
    ctx.fillStyle = '#f1f5f9';
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 8); ctx.fill();

    if (loadedIll) {
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 8);
      ctx.clip();
      const imgW = loadedIll.width; const imgH = loadedIll.height;
      const scale = Math.max(photoW / imgW, photoH / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedIll, photoX + (photoW - drawW) / 2, photoY + (photoH - drawH) / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#9ca3af'; ctx.globalAlpha = 0.5; ctx.font = `700 22px ${font}`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText('上傳插圖', photoX + photoW / 2, photoY + photoH / 2);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    
    // 紙膠帶裝飾（固定在拍立得右上角內側，不會超出主卡片）
    const tapeW = Math.round(polaroidW * 0.32);
    const tapeH = 24;
    ctx.fillStyle = colors.tape; ctx.globalAlpha = 0.85; ctx.save();
    ctx.translate(polaroidX + polaroidW - tapeW - 6, polaroidY - 8); ctx.rotate(0.18);
    drawRoundedRect(ctx, 0, 0, tapeW, tapeH, 4); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
    
    ctx.restore(); // 恢復拍立得旋轉

    // 7. 左側單字與翻譯排版（動態寬度與垂直居中）
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
    const wordLineH = Math.floor(wordFontSize * 1.25);
    const badgeH = 40; const gapBadgeWord = 14; const wordsH = wordLines.length * wordLineH;
    const gapWordTrans = 22; const transH = 46;
    const totalContentH = badgeH + gapBadgeWord + wordsH + gapWordTrans + transH;
    let currentY = cardY + (cardH - totalContentH) / 2;

    // 單字標籤徽章
    const badgeText = '本日の単語';
    ctx.font = `900 22px ${font}`;
    const badgeW = ctx.measureText(badgeText).width + 36;
    ctx.fillStyle = colors.primary;
    drawRoundedRect(ctx, 85, currentY, badgeW, badgeH, badgeH / 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 103, currentY + badgeH / 2);
    currentY += badgeH + gapBadgeWord;

    // 日文單字文字
    ctx.fillStyle = '#1f2937'; ctx.font = `900 ${wordFontSize}px ${font}`; ctx.textBaseline = 'top';
    wordLines.forEach((line, idx) => {
      ctx.fillText(line, 85, currentY + idx * wordLineH);
    });
    currentY += wordsH + gapWordTrans;

    // 中文翻譯膠囊
    ctx.font = `700 28px ${font}`;
    const transW = ctx.measureText(translation).width + 32;
    ctx.save();
    ctx.translate(85, currentY); ctx.rotate(-0.025);
    ctx.fillStyle = '#1f2937'; drawRoundedRect(ctx, 0, 0, transW, transH, 12); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(translation, 16, transH / 2);
    ctx.restore();

    // 8. 繪製底部例句筆記本
    ctx.save();
    ctx.translate(S / 2, noteY + noteH / 2); ctx.rotate(-0.012);
    ctx.translate(-(S / 2), -(noteY + noteH / 2));
    
    // 筆記本白底與陰影
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, 45, noteY, S - 90, noteH, 38); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 2.5; drawRoundedRect(ctx, 45, noteY, S - 90, noteH, 38); ctx.stroke();
    
    // 筆記本紅色左側邊界線
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(140, noteY + 12); ctx.lineTo(140, noteY + noteH - 12); ctx.stroke();
    
    // 星星與標籤
    ctx.fillStyle = '#FBBF24'; ctx.font = `900 24px ${font}`; ctx.textBaseline = 'top'; ctx.fillText('★', 160, noteY + 22);
    ctx.fillStyle = '#64748b'; ctx.font = `900 22px ${font}`; ctx.fillText('例文（例句）', 190, noteY + 24);
    
    // 繪製橫線與文字（透過 middle 對齊，確保文字平穩居中於筆記橫線上）
    ctx.font = `700 ${sentenceFontSize}px ${font}`; 
    wrappedLines.forEach((line, i) => {
      const ly = noteY + noteTopPad + i * lineH;
      // 筆記藍灰橫線
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(160, ly + lineH); ctx.lineTo(S - 80, ly + lineH); ctx.stroke();
      
      // 文字垂直居中對齊於橫線上方
      ctx.fillStyle = '#1e293b';
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
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row p-4 md:p-8 gap-6 justify-center items-center font-sans">
      
      {/* 左側：控制面板 */}
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4 border border-gray-100">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-1">
          <Sparkles className="text-yellow-400" />
          全能彈性編輯器
        </h2>
        
        {/* 上傳按鈕區 */}
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-colors shadow-sm text-center">
            <Camera size={20} />
            <span className="text-sm font-bold">預覽大頭照</span>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setAvatarImage)} className="hidden" />
          </label>
          <label className="cursor-pointer bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-colors shadow-sm text-center">
            <ImageIcon size={20} />
            <span className="text-sm font-bold">上傳單字插圖</span>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setIllustrationImage)} className="hidden" />
          </label>
        </div>

        {/* 字體風格選擇 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Type size={16} className="text-gray-500" />
            日文字體風格
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'zen', name: '日系圓體', desc: 'Zen Maru (推薦)' },
              { id: 'noto', name: '清晰黑體', desc: 'Noto Sans' },
              { id: 'mplus', name: '可愛萌圓', desc: 'M PLUS' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontChoice(f.id as any)}
                className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                  fontChoice === f.id
                    ? 'border-gray-800 bg-gray-900 text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-bold">{f.name}</div>
                <div className={`text-[10px] mt-0.5 ${fontChoice === f.id ? 'text-gray-300' : 'text-gray-400'}`}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 顏色與字體大小 */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">背景主題色</label>
            <div className="flex gap-2">
              {Object.keys(themeColors).map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setThemeColor(color)}
                  className={`w-8 h-8 rounded-full shadow-sm transition-all border-2 ${themeColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: themeColors[color].primary }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-gray-700">單字大小</label>
              <span className="text-xs text-gray-500 font-bold">{wordFontSize}px</span>
            </div>
            <input type="range" min="36" max="96" value={wordFontSize} onChange={e => setWordFontSize(Number(e.target.value))} className="w-full accent-gray-800" />
          </div>
        </div>

        {/* 例句大小 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-bold text-gray-700">例句字體大小</label>
            <span className="text-xs text-gray-500 font-bold">{sentenceFontSize}px</span>
          </div>
          <input type="range" min="24" max="64" value={sentenceFontSize} onChange={e => setSentenceFontSize(Number(e.target.value))} className="w-full accent-gray-800" />
        </div>

        {/* 文字輸入 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">日文單字</label>
            <textarea value={word} onChange={e => setWord(e.target.value)} rows={2} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none resize-none leading-relaxed transition-colors text-sm" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">中文翻譯</label>
            <input type="text" value={translation} onChange={e => setTranslation(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none transition-colors text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">日文例句</label>
          <textarea value={sentenceJP} onChange={e => setSentenceJP(e.target.value)} rows={4} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2.5 font-bold focus:border-blue-400 focus:bg-white outline-none resize-none leading-relaxed transition-colors text-sm" />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-1 bg-gray-900 hover:bg-black text-white rounded-xl p-3.5 font-black flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Download size={20} />
          一鍵下載為 IG 貼文 (高畫質)
        </button>
      </div>

      {/* 右側：絕對 100% 同步的 Canvas 預覽區 */}
      <div className="flex flex-col items-center">
        <div className="relative w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] lg:w-[520px] lg:h-[520px] bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white">
          <canvas 
            ref={canvasRef} 
            width={1080} 
            height={1080} 
            className="w-full h-full object-contain" 
          />
        </div>
      </div>

    </div>
  );
}
