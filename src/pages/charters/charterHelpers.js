export const getCharterFromResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return null
  }

  if (response.charter && typeof response.charter === 'object') {
    return response.charter
  }

  return response
}

export const getCharterId = (response) => {
  const id = getCharterFromResponse(response)?.id
  return id === undefined || id === null || id === '' ? null : id
}

export const applyCharterResponse = (current, response, fallback = {}) => {
  const returned = getCharterFromResponse(response)

  if (!returned || Object.keys(returned).length === 0) {
    return current ? { ...current, ...fallback } : current
  }

  if (!current) {
    return { ...fallback, ...returned }
  }

  return { ...current, ...fallback, ...returned }
}
