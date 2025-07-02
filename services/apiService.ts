import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'https://locco.thomascarrot.com/api'

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Math.floor(Date.now() / 1000)
  } catch (e) {
    console.error(e)
    return true
  }
}

const customFetch = async (url: string, options: RequestInit = {}) => {
  try {
    let token = await AsyncStorage.getItem('token')

    let headers
    if (!token) {
      headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      }
    } else {
      headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      }
    }

    const finalUrl = `${BASE_URL}${url}`

    const fetchOptions = {
      ...options,
      headers,
    }

    const response = await fetch(finalUrl, fetchOptions)

    const responseData = await response.json()

    if (!response.ok) {
      throw responseData
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export const fetcher = (url: string, config: RequestInit = {}) =>
  customFetch(url, { method: 'GET', ...config })

export const fetcherPost = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'POST', body: JSON.stringify(body), ...config })

export const fetcherPut = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'PUT', body: JSON.stringify(body), ...config })

export const fetcherPatch = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'PATCH', body: JSON.stringify(body), ...config })

export const fetcherDelete = (url: string, config: RequestInit = {}) =>
  customFetch(url, { method: 'DELETE', ...config })
