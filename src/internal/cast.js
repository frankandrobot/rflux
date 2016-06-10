export default function cast(obj, Class) {

  return obj instanceof Class ? obj : new Class(obj)
}
