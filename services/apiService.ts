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
  console.debug('customFetch: Starting request', { url, options })
  try {
    let token = await AsyncStorage.getItem('token')
    console.debug('customFetch: Token retrieved from AsyncStorage', {
      token: token ? token : 'absent',
    })

    let headers
    if (!token) {
      headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      }
      console.debug('customFetch: Headers (no token)', { headers })
    } else {
      headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      }
      console.debug('customFetch: Headers (with token)', { headers })
    }

    const finalUrl = `${BASE_URL}${url}`
    console.debug('customFetch: Final URL', { finalUrl })

    const fetchOptions = {
      ...options,
      headers,
    }
    console.debug('customFetch: Fetch options', { fetchOptions })

    const response = await fetch(finalUrl, fetchOptions)
    console.debug('customFetch: Response received', {
      status: response.status,
      ok: response.ok,
      url: response.url,
    })

    const responseData = await response.json()
    console.debug('customFetch: Response data parsed', { responseData })

    if (!response.ok) {
      console.debug('customFetch: Request failed (response not OK)', {
        status: response.status,
        statusText: response.statusText,
        responseData,
      })
      throw responseData
    }

    console.debug('customFetch: Request successful', { responseData })
    return responseData
  } catch (error) {
    console.debug('customFetch: Error during fetch', { error })
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
