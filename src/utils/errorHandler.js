export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 400:
        return {
          message: data.message || 'Неверный запрос',
          errors: data.errors,
          status: 400
        }
      case 401:
        return {
          message: data.message || 'Не авторизован',
          status: 401
        }
      case 403:
        return {
          message: data.message || 'Доступ запрещен',
          status: 403
        }
      case 404:
        return {
          message: data.message || 'Ресурс не найден',
          status: 404
        }
      case 422:
        return {
          message: data.message || 'Ошибка валидации',
          errors: data.errors,
          status: 422
        }
      case 500:
        return {
          message: data.message || 'Внутренняя ошибка сервера',
          status: 500
        }
      default:
        return {
          message: data?.message || 'Произошла ошибка',
          status: status
        }
    }
  } else if (error.request) {
    return {
      message: 'Не удалось подключиться к серверу. Проверьте подключение к интернету.',
      status: 0
    }
  } else {
    return {
      message: error.message || 'Неизвестная ошибка',
      status: -1
    }
  }
}
