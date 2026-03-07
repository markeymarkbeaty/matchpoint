export function debug(label: string, data: any) {

  if (process.env.NODE_ENV !== 'development') return

  console.log(
    `%cMATCHPOINT DEBUG → ${label}`,
    'color:#4ade80;font-weight:bold'
  )

  console.log(data)

}