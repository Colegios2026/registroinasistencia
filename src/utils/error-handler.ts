export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): never => {
  console.error('[Service Error]:', error);
  
  if (error instanceof AppError) {
    throw error;
  }

  // Supabase specific errors - cast locally
  const err = error as { code?: string; message?: string } | undefined;
  if (err?.code) {
    switch (err.code) {
      case '23505':
        throw new AppError('Registro duplicado detectado.', 400, err.code);
      case '23503':
        throw new AppError('Error de referencia: el registro relacionado no existe.', 400, err.code);
      case 'PGRST116':
        throw new AppError('No se encontró el registro solicitado.', 404, err.code);
      default:
        throw new AppError('Error en la base de datos: ' + (err.message || 'Error desconocido'), 500, err.code);
    }
  }

  throw new AppError((err && err.message) || 'Ocurrió un error inesperado.', 500);
};
