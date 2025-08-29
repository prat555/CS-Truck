

import type { Express, RequestHandler } from "express";

export function setupAuth(app: Express) {
  // Local/mock mode: skip auth, always allow
  app.use((req, _res, next) => {
    req.user = { id: 'mock-user', firstName: 'Local', lastName: 'User', points: 0 };
    req.isAuthenticated = () => true;
    next();
  });
  app.get('/api/login', (_req, res) => res.redirect('/'));
  app.get('/api/logout', (_req, res) => res.redirect('/'));
  app.get('/api/callback', (_req, res) => res.redirect('/'));
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  return next();
};
