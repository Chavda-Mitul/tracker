export type SignUpFormValues = {
  name: string
  email: string
  password: string
}

export type LoginFormValues = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
}
