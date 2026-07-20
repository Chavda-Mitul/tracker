export function setCookie(name: string, value: string, days?: number) {
  const expires = days ? `; expires=${new Date(Date.now() + days * 86400000).toUTCString()}` : ""
  document.cookie = `${name}=${value}; path=/${expires}`
}

export function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1]
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
}
