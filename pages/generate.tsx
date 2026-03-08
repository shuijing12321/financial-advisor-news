import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { MaterialType, Material } from '@/types';
import { generateMaterial } from '@/lib/aiService';
import { saveMaterial, generateId } from '@/lib/materialStorage';
import { 
  Video, 
  FileText, 
  Radio, 
  Share2, 
  Sparkles,
  Copy,
  Save,
  Check,
  Loader2,
  Settings,
  AlertCircle
} from 'lucide-react';

const materialTypes: { value: MaterialType; label: string; icon: React.ElementType }[] = [
  { value: 'video', label: '短视频', icon: Video },
  { value: 'article', label: '图文', icon: FileText },
  { value: 'livestream', label: '直播话术', icon: Radio },
  { value: 'social', label: '社交媒体', icon: Share2 },
];

type AIProvider = 'local' | 'openai' | 'anthropic';

export default function Generate() {
  const router = useRouter();
  const { 
    newsId, 
    title: newsTitle, 
    summary: newsSummary, 
    category: newsCategory 
  } = router.query;
  
  const [selectedType, setSelectedType] = useState<MaterialType>('video');
  const [generatedMaterial, setGeneratedMaterial] = useState<{
    title: string;
    content: string;
    script?: string;
  } | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedScript, setEditedScript] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // AI 配置
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAIProvider] = useState<AIProvider>('local');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // 从本地存储加载 AI 配置
    const savedProvider = localStorage.getItem('ai_provider') as AIProvider;
    const savedApiKey = localStorage.getItem('ai_api_key');
    
    if (savedProvider) setAIProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  useEffect(() => {
    if (generatedMaterial) {
      setEditedContent(generatedMaterial.content || '');
      setEditedScript(generatedMaterial.script || '');
      setEditedTitle(generatedMaterial.title || '');
    }
  }, [generatedMaterial]);

  const saveAISettings = () => {
    localStorage.setItem('ai_provider', aiProvider);
    if (apiKey) {
      localStorage.setItem('ai_api_key', apiKey);
    }
    setShowSettings(false);
  };

  const handleGenerate = async () => {
    if (!newsTitle || !newsSummary) {
      alert('缺少新闻信息');
      return;
    }
    
    setGenerating(true);
    setGeneratedMaterial(null);
    
    try {
      // 调用真实API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newsTitle: Array.isArray(newsTitle) ? newsTitle[0] : newsTitle,
          newsSummary: Array.isArray(newsSummary) ? newsSummary[0] : newsSummary,
          newsCategory: Array.isArray(newsCategory) ? newsCategory[0] : newsCategory,
          materialType: selectedType,
          aiProvider,
          apiKey
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setGeneratedMaterial(result.data);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('Failed to generate material:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedMaterial || !newsTitle) return;
    
    setSaving(true);
    try {
      const material: Material = {
        id: generateId(),
        newsId: Array.isArray(newsId) ? newsId[0] : newsId || 'unknown',
        type: selectedType,
        title: editedTitle,
        content: editedContent,
        script: editedScript || undefined,
        tags: [],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveMaterial(material);
      alert('保存成功！');
      router.push('/materials');
    } catch (error) {
      console.error('Failed to save material:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const text = editedScript 
      ? `${editedTitle}\n\n${editedContent}\n\n${editedScript}` 
      : `${editedTitle}\n\n${editedContent}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('复制失败');
    }
  };

  // 如果没有新闻信息，显示提示
  if (!newsTitle && router.isReady) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">请先选择新闻</h2>
        <p className="text-gray-600 mb-4">
          您需要从热点新闻列表中选择一条新闻来生成素材
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          去选择新闻
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 素材生成</h1>
          <p className="text-gray-600 mt-1">
            {aiProvider === 'local' ? '使用模板生成' : `使用 ${aiProvider.toUpperCase()} 生成`}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>AI 设置</span>
        </button>
      </div>

      {/* AI Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 配置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 提供商
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'local', label: '本地模板' },
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' }
                ].map((provider) => (
                  <button
                    key={provider.value}
                    onClick={() => setAIProvider(provider.value as AIProvider)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      aiProvider === provider.value
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>
            </div>
            
            {aiProvider !== 'local' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API Key 仅保存在本地浏览器，不会上传到服务器
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveAISettings}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Info */}
      {newsTitle && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mb-2">
                {Array.isArray(newsCategory) ? newsCategory[0] : newsCategory}
              </span>
              <h2 className="text-lg font-semibold text-gray-900">
                {Array.isArray(newsTitle) ? newsTitle[0] : newsTitle}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {Array.isArray(newsSummary) ? newsSummary[0] : newsSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Material Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">选择素材类型</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {materialTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedType === type.value
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-lg font-medium"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI 生成中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>生成 {materialTypes.find(t => t.value === selectedType)?.label} 素材</span>
          </>
        )}
      </button>

      {/* Generated Material */}
      {generatedMaterial && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '保存中...' : '保存到素材库'}</span>
              </button>
            </div>
          </div>

          {/* AI Provider Info */}
          {aiProvider !== 'local' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>生成方式：</strong>使用 {aiProvider.toUpperCase()} API 生成
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Script */}
          {editedScript && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">脚本/话术</label>
              <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
