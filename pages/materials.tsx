import React, { useState, useEffect } from 'react';
import { Material, MaterialType } from '@/types';
import { 
  getAllMaterials, 
  deleteMaterial, 
  exportMaterialAsText, 
  copyToClipboard 
} from '@/lib/materialStorage';
import { 
  Video, 
  FileText, 
  Radio, 
  Share2, 
  Trash2, 
  Copy,
  Check,
  Eye,
  X,
  Search
} from 'lucide-react';

const materialTypeIcons: Record<MaterialType, React.ElementType> = {
  video: Video,
  article: FileText,
  livestream: Radio,
  social: Share2,
};

const materialTypeLabels: Record<MaterialType, string> = {
  video: '短视频',
  article: '图文',
  livestream: '直播话术',
  social: '社交媒体',
};

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const allMaterials = getAllMaterials();
    setMaterials(allMaterials);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个素材吗？')) {
      deleteMaterial(id);
      loadMaterials();
      if (selectedMaterial?.id === id) {
        setSelectedMaterial(null);
      }
    }
  };

  const handleCopy = async (material: Material) => {
    const text = exportMaterialAsText(material);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(material.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || material.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">我的素材库</h1>
        <p className="text-gray-600 mt-1">管理和编辑已保存的投顾素材</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索素材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部类型</option>
            {Object.entries(materialTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">总素材数</p>
          <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">草稿</p>
          <p className="text-2xl font-bold text-yellow-600">
            {materials.filter(m => m.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已发布</p>
          <p className="text-2xl font-bold text-green-600">
            {materials.filter(m => m.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">已归档</p>
          <p className="text-2xl font-bold text-gray-400">
            {materials.filter(m => m.status === 'archived').length}
          </p>
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {materials.length === 0 ? '暂无素材，快去生成吧！' : '没有找到匹配的素材'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMaterials.map((material) => {
            const Icon = materialTypeIcons[material.type];
            return (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-primary-600" />
                      <span className="text-xs text-gray-500">
                        {materialTypeLabels[material.type]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        material.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        material.status === 'published' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {material.status === 'draft' ? '草稿' : 
                         material.status === 'published' ? '已发布' : '已归档'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {material.content.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      创建于 {formatDate(material.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <button
                      onClick={() => setSelectedMaterial(material)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(material)}
                      className={`p-2 rounded transition-colors ${
                        copiedId === material.id 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="复制"
                    >
                      {copiedId === material.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedMaterial.title}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">
                    {materialTypeLabels[selectedMaterial.type]}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedMaterial.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    selectedMaterial.status === 'published' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedMaterial.status === 'draft' ? '草稿' : 
                     selectedMaterial.status === 'published' ? '已发布' : '已归档'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {selectedMaterial.content}
                </pre>
                {selectedMaterial.script && (
                  <>
                    <hr className="my-4" />
                    <h4 className="text-md font-semibold text-gray-900 mb-2">脚本/话术</h4>
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {selectedMaterial.script}
                    </pre>
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  创建于 {formatDate(selectedMaterial.createdAt)} · 
                  更新于 {formatDate(selectedMaterial.updatedAt)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMaterial.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  handleCopy(selectedMaterial);
                  setSelectedMaterial(null);
                }}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>复制</span>
              </button>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
