import type { MenuDataItem } from '@ant-design/pro-components';

export type AuthRole = {
  rolId?: string;
  rolNm?: string;
  rolCd?: string;
};

export type AuthUser = {
  userId: string;
  userNm: string;
  realNm?: string;
  rmk?: string;
  idTyp?: string;
  idNo?: string;
  tel?: string;
  orgCd?: string;
  stus?: string;
  roles: AuthRole[];
};

export type AuthMenu = {
  menuId: string;
  menuNm: string;
  permCd?: string;
  path?: string;
  prentId?: string;
  sort?: number;
  icon?: string;
  typ?: string;
  isDsp?: number;
  children?: AuthMenu[];
};

export type AuthResources = {
  codes: AuthMenu[];
  menus: AuthMenu[];
};

export type AuthLoginData = {
  accessToken: string;
  authUser: AuthUser;
};

export type AuthSession = AuthLoginData & {
  resources: AuthResources;
};

export type AuthInitialState = {
  currentUser?: API.CurrentUser;
  authResources?: AuthResources;
  menuData?: MenuDataItem[];
};

export type NovaResponse<T> = {
  suc: boolean;
  code: number;
  msg?: string;
  errorMsg?: string;
  data: T;
};
