
interface Props{
  params: Promise<{ id: string }> 
}

export default async function Page(props:Props) {
  const id = (await props.params).id; 

  return (
    <div>
      <h1>Edit {id}</h1>
    </div>
  )
}
