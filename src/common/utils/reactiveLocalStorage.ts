import { Accessor, Setter, createEffect,createSignal } from "solid-js";
import { createStore, Store,SetStoreFunction } from "solid-js/store";

export function createLocalStore<T>(key:string, initialValue:T)
:[Store<T>, SetStoreFunction<T> ] {

  const localData = localStorage.getItem(key);
  const [state, setState] = createStore(
    localData ? JSON.parse(localData) : initialValue
  );

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  });

  return [state, setState];
}

export function createLocalSignal<T>(key:string, initialValue:T)
:[Accessor<T>,Setter<T>] {
    
  const localData = localStorage.getItem(key);
  const [state, setState] = createSignal<T>(
    localData ? JSON.parse(localData) : initialValue
  );

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state()));
  });

  return [state, setState];
}
