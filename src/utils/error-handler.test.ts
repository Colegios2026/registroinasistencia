import { describe, it, expect } from 'vitest';
import { AppError, handleError } from './error-handler';

describe('utils/error-handler', () => {
  it('AppError keeps properties', () => {
    const e = new AppError('boom', 418, 'X123');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('AppError');
    expect(e.message).toBe('boom');
    expect(e.status).toBe(418);
    expect(e.code).toBe('X123');
  });

  it('handleError rethrows AppError unchanged', () => {
    const e = new AppError('fail', 400, 'APP');
    expect(() => handleError(e)).toThrow(e);
  });

  it('handleError maps known DB codes', () => {
    expect(() => handleError({ code: '23505' })).toThrowError(/Registro duplicado detectado/);
    expect(() => handleError({ code: '23503' })).toThrowError(/Error de referencia/);
    expect(() => handleError({ code: 'PGRST116' })).toThrowError(/No se encontró el registro solicitado/);
  });

  it('handleError maps unknown DB code to generic DB message including original message', () => {
    expect(() => handleError({ code: '99999', message: 'detalle' })).toThrowError(/Error en la base de datos: detalle/);
  });

  it('handleError with plain object message uses that message', () => {
    expect(() => handleError({ message: 'algo malo' })).toThrowError(/algo malo/);
  });

  it('handleError with primitive throws generic message', () => {
    expect(() => handleError('string-error')).toThrowError(/Ocurrió un error inesperado/);
    expect(() => handleError(undefined)).toThrowError(/Ocurrió un error inesperado/);
  });
});
