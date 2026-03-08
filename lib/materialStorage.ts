import { Material } from '@/types';

// 本地存储服务
// 使用 localStorage 存储素材数据（实际项目应使用后端数据库）

const STORAGE_KEY = 'financial_advisor_materials';

// 获取所有素材
export function getAllMaterials(): Material[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading materials:', error);
    return [];
  }
}

// 保存素材
export function saveMaterial(material: Material): void {
  if (typeof window === 'undefined') return;
  
  try {
    const materials = getAllMaterials();
    const existingIndex = materials.findIndex(m => m.id === material.id);
    
    if (existingIndex >= 0) {
      materials[existingIndex] = {
        ...material,
        updatedAt: new Date().toISOString()
      };
    } else {
      materials.push(material);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error('Error saving material:', error);
  }
}

// 删除素材
export function deleteMaterial(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const materials = getAllMaterials();
    const filtered = materials.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting material:', error);
  }
}

// 获取单个素材
export function getMaterialById(id: string): Material | null {
  const materials = getAllMaterials();
  return materials.find(m => m.id === id) || null;
}

// 按类型筛选素材
export function getMaterialsByType(type: string): Material[] {
  const materials = getAllMaterials();
  if (type === 'all') return materials;
  return materials.filter(m => m.type === type);
}

// 按状态筛选素材
export function getMaterialsByStatus(status: string): Material[] {
  const materials = getAllMaterials();
  if (status === 'all') return materials;
  return materials.filter(m => m.status === status);
}

// 生成唯一 ID
export function generateId(): string {
  return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 导出素材为文本
export function exportMaterialAsText(material: Material): string {
  let text = `标题：${material.title}\n\n`;
  text += `类型：${material.type}\n`;
  text += `标签：${material.tags.join(', ')}\n`;
  text += `创建时间：${new Date(material.createdAt).toLocaleString('zh-CN')}\n\n`;
  text += `--- 内容 ---\n\n${material.content}\n`;
  
  if (material.script) {
    text += `\n--- 脚本/话术 ---\n\n${material.script}\n`;
  }
  
  return text;
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    // 降级方案
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (e) {
      return false;
    }
  }
}
