import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string): string => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  
  return jwt.sign(
    { userId, role },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): any => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret);
};

