import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all heavy dependencies before importing app
const mockReplace = vi.fn();
const mockHistory = {
  location: {
    pathname: '/welcome',
    search: '',
    hash: '',
  },
  replace: mockReplace,
};

const mockGetResources = vi.fn();

vi.mock('@umijs/max', () => ({
  history: mockHistory,
  Link: ({ children }: any) => children,
}));

vi.mock('@/services/auth', () => ({
  getResources: mockGetResources,
}));

vi.mock('@/components', () => ({
  AvatarDropdown: () => null,
  DocLink: () => null,
  ErrorBoundary: ({ children }: any) => children,
  Footer: () => null,
  LangDropdown: () => null,
  OfflineBanner: () => null,
  VersionDropdown: () => null,
}));

vi.mock('@ant-design/pro-components', () => ({
  SettingDrawer: () => null,
}));

vi.mock('@ant-design/icons', () => ({
  LinkOutlined: () => null,
}));

vi.mock('./requestErrorConfig', () => ({
  errorConfig: {},
}));

vi.mock('../config/defaultSettings', () => ({
  default: { navTheme: 'light' },
}));

describe('app getInitialState', () => {
  const cacheSession = (userOverrides: Record<string, unknown> = {}) => {
    localStorage.setItem(
      'nova.auth.session',
      JSON.stringify({
        accessToken: 'token-1',
        authUser: {
          userId: '1',
          userNm: 'admin',
          realNm: 'Test User',
          roles: [{ rolCd: 'admin' }],
          ...userOverrides,
        },
        resources: { codes: [], menus: [] },
      }),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockHistory.location = {
      pathname: '/welcome',
      search: '',
      hash: '',
    };
  });

  it('should fetch currentUser when not on login page', async () => {
    const { getInitialState } = await import('./app');
    cacheSession();
    mockGetResources.mockResolvedValue({
      data: { codes: [], menus: [] },
    });

    const state = await getInitialState();

    expect(mockGetResources).toHaveBeenCalled();
    expect(state.currentUser).toEqual({
      userid: '1',
      name: 'Test User',
      phone: undefined,
      access: 'admin',
    });
    expect(state.settingDrawerOpen).toBe(false);
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should redirect to login when currentUser fetch fails (401)', async () => {
    const { getInitialState } = await import('./app');
    cacheSession();
    mockGetResources.mockRejectedValue(new Error('401 Unauthorized'));

    const state = await getInitialState();

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('/user/login?redirect='),
    );
    expect(state.currentUser).toBeUndefined();
  });

  it('should not fetch currentUser on login page', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/user/login',
      search: '',
      hash: '',
    };

    const state = await getInitialState();

    expect(mockGetResources).not.toHaveBeenCalled();
    expect(state.currentUser).toBeUndefined();
    expect(state.fetchUserInfo).toBeDefined();
  });

  it('should encode redirect path correctly on 401', async () => {
    const { getInitialState } = await import('./app');
    mockHistory.location = {
      pathname: '/admin/users',
      search: '?page=2',
      hash: '#section',
    };
    cacheSession();
    mockGetResources.mockRejectedValue(new Error('401'));

    await getInitialState();

    expect(mockReplace).toHaveBeenCalledWith(
      `/user/login?redirect=${encodeURIComponent('/admin/users?page=2#section')}`,
    );
  });

  it('should include default settings in initial state', async () => {
    const { getInitialState } = await import('./app');
    cacheSession();
    mockGetResources.mockResolvedValue({
      data: { codes: [], menus: [] },
    });

    const state = await getInitialState();

    expect(state.settings).toEqual({ navTheme: 'light' });
  });

  it('fetchUserInfo should return user data on success', async () => {
    const { getInitialState } = await import('./app');
    cacheSession({
      userNm: 'fetched',
      realNm: 'Fetched User',
      roles: [],
    });
    mockGetResources.mockResolvedValue({
      data: { codes: [], menus: [] },
    });

    const state = await getInitialState();

    const user = await state.fetchUserInfo?.();
    expect(user).toEqual({
      userid: '1',
      name: 'Fetched User',
      phone: undefined,
      access: 'user',
    });
  });
});
