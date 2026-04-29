import {
  All,
  Controller,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const SERVICES: Record<string, string> = {
  '/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  '/users': process.env.USER_SERVICE_URL || 'http://user-service:3002',
  '/restaurants': process.env.RESTAURANT_SERVICE_URL || 'http://restaurant-service:3003',
  '/cart': process.env.CART_SERVICE_URL || 'http://cart-service:3004',
  '/orders': process.env.ORDER_SERVICE_URL || 'http://order-service:3005',
  '/payment': process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3006',
  '/delivery': process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3007',
  '/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008',
};

const PUBLIC_ROUTES = ['/auth/register', '/auth/login', '/restaurants'];

function resolveService(path: string): string | null {
  for (const prefix of Object.keys(SERVICES)) {
    if (path.startsWith(prefix)) return SERVICES[prefix];
  }
  return null;
}

function isPublicRoute(path: string, method: string): boolean {
  if (PUBLIC_ROUTES.some((r) => path.startsWith(r) && method === 'GET')) return true;
  if (path === '/auth/register' || path === '/auth/login') return true;
  return false;
}

@Controller()
export class ProxyController {
  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.path;
    const serviceUrl = resolveService(path);

    if (!serviceUrl) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Service not found' });
    }

    if (!isPublicRoute(path, req.method)) {
      const token = req.headers['authorization'];
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
      }
    }

    try {
      const config: AxiosRequestConfig = {
        method: req.method as any,
        url: `${serviceUrl}${path}`,
        params: req.query,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,
          'content-length': undefined,
        },
        validateStatus: () => true,
      };

      const response = await axios(config);
      res.status(response.status).json(response.data);
    } catch (err) {
      throw new HttpException(
        { error: 'Service unavailable', message: err.message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
