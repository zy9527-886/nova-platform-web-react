import {
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-components';
import { createElement } from 'react';
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

const menuIcons = {
  MenuOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
};

const getMenuIcon = (name?: string) => {
  if (!name) return undefined;
  const Icon = menuIcons[name as keyof typeof menuIcons];
  return Icon ? createElement(Icon) : undefined;
};

export const toCurrentUser = (user: AuthUser): API.CurrentUser => ({
  userid: user.userId,
  name: user.realNm || user.userNm,
  phone: user.tel,
  access: user.roles.some((role) => role.rolCd === 'admin') ? 'admin' : 'user',
});

const mapAuthMenuNodes = (
  menus: AuthMenu[],
  level: number,
): MenuDataItem[] =>
  menus
    .filter((menu) => menu.isDsp !== 0)
    .map((menu) => {
      const icon = getMenuIcon(menu.icon);
      const children = mapAuthMenuNodes(menu.children ?? [], level + 1);
      return {
        key: menu.menuId,
        name: menu.menuNm,
        path: menu.path,
        icon,
        novaShowChildIcon: level > 0 && Boolean(icon),
        ...(children.length > 0 ? { children } : {}),
      };
    });

export const mapAuthMenus = (menus: AuthMenu[]): MenuDataItem[] =>
  mapAuthMenuNodes(menus, 0);
