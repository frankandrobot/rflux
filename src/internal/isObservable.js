import {Observable} from 'kefir'


export default function isObservable(obj) {

  return obj && obj instanceof Observable
}
