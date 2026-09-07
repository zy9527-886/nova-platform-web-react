import type { MenuDataItem } from '@ant-design/pro-components';
import type { AuthMenu, AuthSession, AuthUser } from '@/types/auth';

export const AUTH_STORAGE_KEY = 'nova.auth.session';

const getStorage = () =>
  typeof window === 'undefined' ? undefined : window.localStorage;

export const saveAuthSession = (session: AuthSession) => {
  getStorage()?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const loadAuthSession = (): AuthSession | undefined => {
  const storage = getStorage();
  const cached = storage?.getItem(AUTH_STORAGE_KEY);
  if (!cached) return undefined;

  try {
    const session = JSON.parse(cached) as AuthSession;
    if (!session.accessToken || !session.authUser?.userId) {
      throw new Error('Invalid auth session');
    }
    return session;
  } catch {
    storage?.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  }
};

export const clearAuthSession = () => {
  getStorage()?.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = () => loadAuthSession()?.accessToken;

export const toCurrentUser = (user: AuthUser): API.CurrentUser => ({
  userid: user.userId,
  name: user.realNm || user.userNm,
  phone: user.tel,
  access: user.roles.some((role) => role.rolCd === 'admin') ? 'admin' : 'user',
});

export const mapAuthMenus = (menus: AuthMenu[]): MenuDataItem[] =>
  menus
    .filter((menu) => menu.isDsp !== 0)
    .map((menu) => {
      const children = mapAuthMenus(menu.children ?? []);
      return {
        key: menu.menuId,
        name: menu.menuNm,
        path: menu.path,
        icon: menu.icon,
        ...(children.length > 0 ? { children } : {}),
      };
    });
