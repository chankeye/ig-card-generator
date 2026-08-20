import React, { useRef, useState, useEffect } from 'react';
import { Camera, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function App() {
  const [word, setWord] = useState('引きこもり\n(引きこもり)');
  const [translation, setTranslation] = useState('宅在家、不出門的人');
  const [sentenceJP, setSentenceJP] = useState('連休は一歩も外に出ず、完全な引きこもり生活を送りました。\n連休は一歩も外に出ず、完全な引きこもり生活を送りました。'); 
  const [themeColor, setThemeColor] = useState('yellow');
  
  // 字體大小控制
  const [wordFontSize, setWordFontSize] = useState(56);
  const [sentenceFontSize, setSentenceFontSize] = useState(46); // 預設字體大小改為 46
  
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [illustrationImage, setIllustrationImage] = useState<string | null>(null);

  const [loadedAvatar, setLoadedAvatar] = useState<HTMLImageElement | null>(null);
  const [loadedIll, setLoadedIll] = useState<HTMLImageElement | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    const font = '"Noto Sans JP", "Noto Sans TC", "Microsoft JhengHei", "Yu Gothic", "Meiryo", sans-serif';

    // 1. 清空與背景
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = colors.bg;
    drawRoundedRect(ctx, 0, 0, S, S, 60);
    ctx.fill();

    // 2. 裝飾圓形
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath(); ctx.arc(S * 0.85, S * 0.05, S * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(S * 0.1, S * 0.95, S * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // 3. Header: 大頭照 + 標題
    const headerY = 70;
    ctx.save();
    ctx.beginPath(); ctx.arc(110, headerY + 60, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    ctx.beginPath(); ctx.arc(110, headerY + 60, 54, 0, Math.PI * 2); ctx.clip();
    if (loadedAvatar) {
      const imgW = loadedAvatar.width; const imgH = loadedAvatar.height;
      const scale = Math.max(108 / imgW, 108 / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedAvatar, 110 - drawW / 2, headerY + 60 - drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = '#FEF3C7'; ctx.fillRect(56, headerY + 6, 108, 108);
      ctx.fillStyle = '#D97706'; ctx.font = `900 48px ${font}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('吉', 110, headerY + 60);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    ctx.fillStyle = '#1f2937'; ctx.font = `900 44px ${font}`; ctx.textBaseline = 'middle';
    ctx.fillText('吉武的日文小教室', 185, headerY + 45);
    ctx.fillStyle = '#6b7280'; ctx.font = `700 20px ${font}`;
    ctx.fillText('@languagetrailsfree', 185, headerY + 82);

    // 4. 計算例句區域高度 (動態伸縮)
    ctx.font = `700 ${sentenceFontSize}px ${font}`;
    let _lc = 0;
    const maxNoteTextW = 820;
    const wrappedLines: string[] = [];
    for (const oLine of sentenceJP.split('\n')) {
      if (oLine === '') { wrappedLines.push(''); _lc++; continue; }
      let currentLine = '';
      for (const char of oLine) {
        if (ctx.measureText(currentLine + char).width > maxNoteTextW && currentLine.length > 0) {
          wrappedLines.push(currentLine); currentLine = char; _lc++;
        } else { currentLine += char; }
      }
      if (currentLine) { wrappedLines.push(currentLine); _lc++; }
    }
    
    const noteTopPad = 70; 
    const noteBotPad = 40; 
    // 行高依據字體大小動態調整 (大約 1.6 倍)
    const lineH = Math.floor(sentenceFontSize * 1.6);
    const noteH = noteTopPad + _lc * lineH + noteBotPad;
    const noteY = S - noteH - 40; 

    // 5. 中間單字卡區域
    const cardY = 250;
    const cardH = noteY - cardY - 32; 
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    drawRoundedRect(ctx, 50, cardY, S - 100, cardH, 50); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
    drawRoundedRect(ctx, 50, cardY, S - 100, cardH, 50); ctx.stroke();

    // 6. 單字與翻譯排版
    ctx.font = `900 ${wordFontSize}px ${font}`;
    const maxWordW = 460;
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
    const badgeH = 42; const gapBadgeWord = 13; const wordsH = wordLines.length * wordLineH;
    const gapWordTrans = 25; const transH = 46;
    const totalContentH = badgeH + gapBadgeWord + wordsH + gapWordTrans + transH;
    let currentY = cardY + (cardH - totalContentH) / 2;

    // 單字徽章
    const badgeText = '本日の単語';
    ctx.font = `900 24px ${font}`;
    const badgeW = ctx.measureText(badgeText).width + 36;
    ctx.fillStyle = colors.primary;
    drawRoundedRect(ctx, 90, currentY, badgeW, badgeH, badgeH / 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 108, currentY + badgeH / 2);
    currentY += badgeH + gapBadgeWord;

    // 日文單字
    ctx.fillStyle = '#1f2937'; ctx.font = `900 ${wordFontSize}px ${font}`; ctx.textBaseline = 'top';
    wordLines.forEach((line, idx) => {
      ctx.fillText(line, 90, currentY + idx * wordLineH);
    });
    currentY += wordsH + gapWordTrans;

    // 中文翻譯
    ctx.font = `700 28px ${font}`;
    const transW = ctx.measureText(translation).width + 32;
    ctx.save();
    ctx.translate(95, currentY); ctx.rotate(-0.03);
    ctx.fillStyle = '#1f2937'; drawRoundedRect(ctx, 0, 0, transW, transH, 12); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(translation, 16, transH / 2);
    ctx.restore();

    // 7. 右側拍立得相框 (插圖)
    const polaroidW = 340; const polaroidH = 370;
    const polaroidX = S - 50 - polaroidW - 40;
    const polaroidY = cardY + (cardH - polaroidH) / 2;

    ctx.save();
    ctx.translate(polaroidX + polaroidW / 2, polaroidY + polaroidH / 2);
    ctx.rotate(0.04);
    ctx.translate(-(polaroidX + polaroidW / 2), -(polaroidY + polaroidH / 2));

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, polaroidX, polaroidY, polaroidW, polaroidH, 16); ctx.fill();
    ctx.shadowColor = 'transparent';

    const photoPad = 18; const photoW = polaroidW - photoPad * 2; const photoS = photoW;
    const photoX = polaroidX + photoPad; const photoY = polaroidY + photoPad;
    
    ctx.fillStyle = '#f8fafc'; drawRoundedRect(ctx, photoX, photoY, photoS, photoS, 8); ctx.fill();

    if (loadedIll) {
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoS, photoS, 8);
      ctx.clip();
      const imgW = loadedIll.width; const imgH = loadedIll.height;
      const scale = Math.max(photoS / imgW, photoS / imgH);
      const drawW = imgW * scale; const drawH = imgH * scale;
      ctx.drawImage(loadedIll, photoX + (photoS - drawW) / 2, photoY + (photoS - drawH) / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#9ca3af'; ctx.globalAlpha = 0.4; ctx.font = `700 22px ${font}`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText('上傳插圖', photoX + photoS / 2, photoY + photoS / 2);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    
    // 膠帶
    ctx.fillStyle = colors.tape; ctx.globalAlpha = 0.8; ctx.save();
    ctx.translate(polaroidX + polaroidW - 75, polaroidY - 15); ctx.rotate(0.26);
    drawRoundedRect(ctx, 0, 0, 96, 26, 4); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; ctx.restore();

    // 8. 繪製底部例句筆記本
    ctx.save();
    ctx.translate(S / 2, noteY + noteH / 2); ctx.rotate(-0.015);
    ctx.translate(-(S / 2), -(noteY + noteH / 2));
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, 50, noteY, S - 100, noteH, 40); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#f3f4f6'; ctx.lineWidth = 3; drawRoundedRect(ctx, 50, noteY, S - 100, noteH, 40); ctx.stroke();
    
    ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(145, noteY + 10); ctx.lineTo(145, noteY + noteH - 10); ctx.stroke();
    
    // 星星與標籤
    ctx.fillStyle = '#FBBF24'; ctx.font = `900 24px ${font}`; ctx.textBaseline = 'top'; ctx.fillText('★', 165, noteY + 22);
    ctx.fillStyle = '#6b7280'; ctx.font = `900 22px ${font}`; ctx.fillText('例文（例句）', 195, noteY + 24);
    
    // 繪製橫線與文字
    ctx.font = `700 ${sentenceFontSize}px ${font}`; 
    ctx.fillStyle = '#1f2937'; ctx.textBaseline = 'top';
    wrappedLines.forEach((line, i) => {
      const ly = noteY + noteTopPad + i * lineH;
      // 畫線
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(165, ly + lineH - 2); ctx.lineTo(S - 90, ly + lineH - 2); ctx.stroke();
      
      // 動態計算文字 Y 軸偏移，讓文字永遠完美對齊在橫線上方
      const textOffset = Math.floor((lineH - sentenceFontSize) / 2) - 2;
      ctx.fillStyle = '#1f2937'; ctx.fillText(line, 165, ly + textOffset);
    });
    ctx.restore();

  }, [word, translation, sentenceJP, themeColor, loadedAvatar, loadedIll, wordFontSize, sentenceFontSize]);

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
          一鍵下載為 IG 貼文 (光速版)
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
