export interface Car {
  id: string
  name: string
  slug: string
  engine: string | null
  transmission: string | null
  fuel_type: string | null
  price_per_day: number
  image_url: string | null
  available: boolean
  description: string | null
  created_at: string
}

export interface CarImage {
  id: string
  car_id: string
  url: string
  position: number
  created_at: string
}

export interface Reservation {
  id: string
  car_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  start_date: string
  end_date: string
  total_price: number | null
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  cars?: Car
}

export interface ContactRequest {
  id: string
  name: string
  phone: string
  email: string | null
  message: string
  resolved: boolean
  type: 'inchirieri' | 'tractari'
  created_at: string
}
