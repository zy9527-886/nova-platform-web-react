import { request } from '@umijs/max';
import { sm2, sm3 } from 'sm-crypto';
import { AUTH_API_PREFIX, SM2_PUBLIC_KEY } from '../../config/auth';
import type {
  AuthLoginData,
  AuthResources,
  NovaResponse,
} from '@/types/auth';

const encryptPassword = (password: string) => {
  const digest = sm3(password);
  const cipherText = sm2.doEncrypt(digest, SM2_PUBLIC_KEY, 1);
  return `04${cipherText}`;
};

export const login = (params: { username: string; password: string }) =>
  request<NovaResponse<AuthLoginData>>(`${AUTH_API_PREFIX}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {
      username: params.username,
      password: encryptPassword(params.password),
    },
  });

export const getResources = (accessToken?: string) =>
  request<NovaResponse<AuthResources>>(`${AUTH_API_PREFIX}/resources`, {
    method: 'GET',
    ...(accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {}),
  });

export const logout = () =>
  request<NovaResponse<boolean>>(`${AUTH_API_PREFIX}/logout`, {
    method: 'POST',
  });
