import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import JsonTool from './pages/JsonTool';
import ImageCompressor from './pages/ImageCompressor';
import QrCodeTool from './pages/QrCodeTool';
import Base64Tool from './pages/Base64Tool';
import TimestampTool from './pages/TimestampTool';
import ColorTool from './pages/ColorTool';
import UrlTool from './pages/UrlTool';
import TextStatsTool from './pages/TextStatsTool';
import RegexTool from './pages/RegexTool';
import MarkdownTool from './pages/MarkdownTool';
import JwtTool from './pages/JwtTool';
import NumberBaseTool from './pages/NumberBaseTool';
import CssUnitTool from './pages/CssUnitTool';
import JsonCsvTool from './pages/JsonCsvTool';
import HashTool from './pages/HashTool';
import FaviconTool from './pages/FaviconTool';
import LoremTool from './pages/LoremTool';
import HttpStatusTool from './pages/HttpStatusTool';
import CronTool from './pages/CronTool';
import DiffTool from './pages/DiffTool';
import UuidTool from './pages/UuidTool';
import PasswordTool from './pages/PasswordTool';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json" element={<JsonTool />} />
          <Route path="/image" element={<ImageCompressor />} />
          <Route path="/qrcode" element={<QrCodeTool />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/timestamp" element={<TimestampTool />} />
          <Route path="/color" element={<ColorTool />} />
          <Route path="/url" element={<UrlTool />} />
          <Route path="/text-stats" element={<TextStatsTool />} />
          <Route path="/regex" element={<RegexTool />} />
          <Route path="/markdown" element={<MarkdownTool />} />
          <Route path="/jwt" element={<JwtTool />} />
          <Route path="/number-base" element={<NumberBaseTool />} />
          <Route path="/css-unit" element={<CssUnitTool />} />
          <Route path="/json-csv" element={<JsonCsvTool />} />
          <Route path="/hash" element={<HashTool />} />
          <Route path="/favicon" element={<FaviconTool />} />
          <Route path="/lorem" element={<LoremTool />} />
          <Route path="/http-status" element={<HttpStatusTool />} />
          <Route path="/cron" element={<CronTool />} />
          <Route path="/diff" element={<DiffTool />} />
          <Route path="/uuid" element={<UuidTool />} />
          <Route path="/password" element={<PasswordTool />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
