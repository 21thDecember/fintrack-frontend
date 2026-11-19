export interface Person {
  id: string
  name: string
  phone?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePersonDto {
  name: string
  phone?: string
  note?: string
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {}
