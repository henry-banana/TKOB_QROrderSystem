/**
 * Mock Menu Service
 * Intercepts menu API calls and returns mock data when in mock mode
 */

import { mockCategories, mockMenuItems, mockModifierGroups } from './menu-data';

const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Simulate API delay
 */
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Menu Items API
 */
export const mockMenuItemsAPI = {
  async findAll() {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Returning mock menu items');
    
    return {
      success: true,
      data: {
        data: mockMenuItems,
        meta: {
          total: mockMenuItems.length,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      },
    };
  },

  async findOne(id: string) {
    if (!useMockData) return null;
    
    await delay();
    const item = mockMenuItems.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    
    console.log('🎭 [MockMenuService] Returning mock menu item:', id);
    return {
      success: true,
      data: item,
    };
  },

  async create(data: any) {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Mock create menu item:', data);
    
    const newItem = {
      id: `item-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: mockCategories.find(c => c.id === data.categoryId),
    };
    
    mockMenuItems.push(newItem);
    
    return {
      success: true,
      data: newItem,
    };
  },

  async update(id: string, data: any) {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Mock update menu item:', id, data);
    
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');
    
    mockMenuItems[index] = {
      ...mockMenuItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockMenuItems[index],
    };
  },

  async delete(id: string) {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Mock delete menu item:', id);
    
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      mockMenuItems.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Item deleted successfully',
    };
  },
};

/**
 * Mock Categories API
 */
export const mockCategoriesAPI = {
  async findAll() {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Returning mock categories');
    
    return {
      success: true,
      data: {
        data: mockCategories,
        meta: {
          total: mockCategories.length,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      },
    };
  },

  async findOne(id: string) {
    if (!useMockData) return null;
    
    await delay();
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    
    return {
      success: true,
      data: category,
    };
  },

  async create(data: any) {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Mock create category:', data);
    
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockCategories.push(newCategory);
    
    return {
      success: true,
      data: newCategory,
    };
  },

  async update(id: string, data: any) {
    if (!useMockData) return null;
    
    await delay();
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    mockCategories[index] = {
      ...mockCategories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockCategories[index],
    };
  },

  async delete(id: string) {
    if (!useMockData) return null;
    
    await delay();
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  },
};

/**
 * Mock Modifier Groups API
 */
export const mockModifierGroupsAPI = {
  async findAll() {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Returning mock modifier groups');
    
    return {
      success: true,
      data: mockModifierGroups,
    };
  },

  async findOne(id: string) {
    if (!useMockData) return null;
    
    await delay();
    const group = mockModifierGroups.find(g => g.id === id);
    if (!group) throw new Error('Modifier group not found');
    
    return {
      success: true,
      data: group,
    };
  },

  async create(data: any) {
    if (!useMockData) return null;
    
    await delay();
    console.log('🎭 [MockMenuService] Mock create modifier group:', data);
    
    const newGroup = {
      id: `mod-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockModifierGroups.push(newGroup);
    
    return {
      success: true,
      data: newGroup,
    };
  },

  async update(id: string, data: any) {
    if (!useMockData) return null;
    
    await delay();
    const index = mockModifierGroups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Modifier group not found');
    
    mockModifierGroups[index] = {
      ...mockModifierGroups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockModifierGroups[index],
    };
  },

  async delete(id: string) {
    if (!useMockData) return null;
    
    await delay();
    const index = mockModifierGroups.findIndex(g => g.id === id);
    if (index !== -1) {
      mockModifierGroups.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Modifier group deleted successfully',
    };
  },
};

/**
 * Check if URL matches menu API pattern and return mock data
 */
export const getMockResponseForURL = async (method: string, url: string, data?: any) => {
  if (!useMockData) return null;

  // Menu Items
  if (url.includes('/api/v1/menu/item')) {
    if (method === 'GET' && !url.match(/\/item\/[^/]+$/)) {
      return mockMenuItemsAPI.findAll();
    }
    if (method === 'GET' && url.match(/\/item\/([^/]+)$/)) {
      const id = url.match(/\/item\/([^/]+)$/)?.[1];
      return id ? mockMenuItemsAPI.findOne(id) : null;
    }
    if (method === 'POST') {
      return mockMenuItemsAPI.create(data);
    }
    if (method === 'PATCH' && url.match(/\/item\/([^/]+)$/)) {
      const id = url.match(/\/item\/([^/]+)$/)?.[1];
      return id ? mockMenuItemsAPI.update(id, data) : null;
    }
    if (method === 'DELETE' && url.match(/\/item\/([^/]+)$/)) {
      const id = url.match(/\/item\/([^/]+)$/)?.[1];
      return id ? mockMenuItemsAPI.delete(id) : null;
    }
  }

  // Categories
  if (url.includes('/api/v1/menu/category')) {
    if (method === 'GET' && !url.match(/\/category\/[^/]+$/)) {
      return mockCategoriesAPI.findAll();
    }
    if (method === 'GET' && url.match(/\/category\/([^/]+)$/)) {
      const id = url.match(/\/category\/([^/]+)$/)?.[1];
      return id ? mockCategoriesAPI.findOne(id) : null;
    }
    if (method === 'POST') {
      return mockCategoriesAPI.create(data);
    }
    if (method === 'PATCH' && url.match(/\/category\/([^/]+)$/)) {
      const id = url.match(/\/category\/([^/]+)$/)?.[1];
      return id ? mockCategoriesAPI.update(id, data) : null;
    }
    if (method === 'DELETE' && url.match(/\/category\/([^/]+)$/)) {
      const id = url.match(/\/category\/([^/]+)$/)?.[1];
      return id ? mockCategoriesAPI.delete(id) : null;
    }
  }

  // Modifier Groups
  if (url.includes('/api/v1/menu/modifier-group')) {
    if (method === 'GET' && !url.match(/\/modifier-group\/[^/]+$/)) {
      return mockModifierGroupsAPI.findAll();
    }
    if (method === 'GET' && url.match(/\/modifier-group\/([^/]+)$/)) {
      const id = url.match(/\/modifier-group\/([^/]+)$/)?.[1];
      return id ? mockModifierGroupsAPI.findOne(id) : null;
    }
    if (method === 'POST') {
      return mockModifierGroupsAPI.create(data);
    }
    if (method === 'PATCH' && url.match(/\/modifier-group\/([^/]+)$/)) {
      const id = url.match(/\/modifier-group\/([^/]+)$/)?.[1];
      return id ? mockModifierGroupsAPI.update(id, data) : null;
    }
    if (method === 'DELETE' && url.match(/\/modifier-group\/([^/]+)$/)) {
      const id = url.match(/\/modifier-group\/([^/]+)$/)?.[1];
      return id ? mockModifierGroupsAPI.delete(id) : null;
    }
  }

  return null;
};
