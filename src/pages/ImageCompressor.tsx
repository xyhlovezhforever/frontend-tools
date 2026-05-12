import { useRef, useState } from 'react';

type Result = {
  name: string;
  originalSize: number;
  originalUrl: string;
  compressedSize: number;
  compressedUrl: string;
  width: number;
  height: number;
  outWidth: number;
  outHeight: number;
  mime: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [outputType, setOutputType] = useState<'image/jpeg' | 'image/webp' | 'image/png'>(
    'image/jpeg',
  );
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const compress = async (file: File) => {
    setError('');
    setBusy(true);
    try {
      const originalUrl = URL.createObjectURL(file);
      const img = await loadImage(originalUrl);
      const ratio = Math.min(1, maxWidth / img.naturalWidth);
      const outWidth = Math.round(img.naturalWidth * ratio);
      const outHeight = Math.round(img.naturalHeight * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 canvas 上下文');
      ctx.drawImage(img, 0, 0, outWidth, outHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, outputType, outputType === 'image/png' ? undefined : quality),
      );
      if (!blob) throw new Error('压缩失败');
      const compressedUrl = URL.createObjectURL(blob);

      setResult({
        name: file.name,
        originalSize: file.size,
        originalUrl,
        compressedSize: blob.size,
        compressedUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        outWidth,
        outHeight,
        mime: outputType,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    compress(file);
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = result.mime.split('/')[1];
    const base = result.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    a.download = `${base}-min.${ext}`;
    a.click();
  };

  return (
    <>
      <div className="page-header">
        <h1>图片压缩</h1>
        <p>纯本地压缩,支持 JPG/PNG/WebP,可调整输出质量与最大宽度。</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <label className="label">
            质量
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={outputType === 'image/png'}
            />
            <span style={{ width: 36, textAlign: 'right' }}>{Math.round(quality * 100)}%</span>
          </label>
          <label className="label">
            最大宽度
            <input
              className="input"
              type="number"
              style={{ width: 100 }}
              value={maxWidth}
              min={100}
              max={10000}
              onChange={(e) => setMaxWidth(Number(e.target.value) || 1920)}
            />
            px
          </label>
          <label className="label">
            输出格式
            <select
              className="select"
              value={outputType}
              onChange={(e) => setOutputType(e.target.value as 'image/jpeg' | 'image/webp' | 'image/png')}
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
        </div>

        <div
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          {busy ? '正在压缩...' : '点击选择图片或拖拽到此处'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {error && <div className="alert-error">{error}</div>}

        {result && (
          <>
            <div className="image-result">
              <div className="image-card">
                <div className="preview">
                  <img src={result.originalUrl} alt="original" />
                </div>
                <div className="meta">
                  <span>原图 · {formatSize(result.originalSize)}</span>
                  <span>
                    {result.width} × {result.height}
                  </span>
                </div>
              </div>
              <div className="image-card">
                <div className="preview">
                  <img src={result.compressedUrl} alt="compressed" />
                </div>
                <div className="meta">
                  <span>
                    压缩后 · {formatSize(result.compressedSize)} (
                    {Math.round((1 - result.compressedSize / result.originalSize) * 100)}%)
                  </span>
                  <span>
                    {result.outWidth} × {result.outHeight}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={handleDownload}>
                下载压缩后的图片
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}
