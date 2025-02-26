// import { atom, atomFamily, selectorFamily } from 'recoil';
// import { FilterConfig, View } from '../../../../shared/src/types/';

// type ResourceKey = string;

// interface AuthData {
//   isAuthenticated: boolean;
//   loading: boolean;
//   userInfo: {
//     id: number;
//     email: string;
//     name: string;
//     role: {
//       id: number;
//       name: string;
//     };
//     permissions: Array<{
//       id: number;
//       name: string;
//     }>;
//   }
// }

// export const authAtom = atom<AuthData>({
//   key: 'authAtom',
//   default: {
//     isAuthenticated: false,
//     loading: true,
//     userInfo: {
//       id: 0,
//       name: '',
//       role: {
//         id: 0,
//         name: ''
//       },
//       email: '',
//       permissions: [],
//     }
//   }
// });

// // Existing Atoms
// export const dataState = atomFamily<any[], ResourceKey>({
//   key: 'dataState',
//   default: [],
// });

// export const totalRecordsState = atomFamily<number, ResourceKey>({
//   key: 'totalRecordsState',
//   default: 0,
// });



// export const loadingState = atomFamily<boolean, ResourceKey>({
//   key: 'loadingState',
//   default: true,
// });

// export const errorState = atomFamily<string | null, ResourceKey>({
//   key: 'errorState',
//   default: null,
// });

// export const currentViewIdState = atomFamily<number | null, ResourceKey>({
//   key: 'currentViewIdState',
//   default: null,
// });

// export const viewsState = atomFamily<View[], ResourceKey>({
//   key: 'viewsState',
//   default: [],
// });

// export const initialFilterConfigState = atomFamily<FilterConfig | undefined, ResourceKey>({
//   key: 'initialFilterConfigState',
//   default: undefined,
// });

// export const pageState = atomFamily<number, ResourceKey>({
//   key: 'pageState',
//   default: 1,
// });

// export const pageSizeState = atomFamily<number, ResourceKey>({
//   key: 'pageSizeState',
//   default: 25,
// });

// export const currentViewNameState = atomFamily<string, ResourceKey>({
//   key: 'currentViewName',
//   default: ""
// })

// export const innitialViewNameState = atomFamily<string, ResourceKey>({
//   key: 'innitialViewName',
//   default: ""
// })

// export const currentFilterConfigState = atomFamily<FilterConfig | null, ResourceKey>({
//   key: 'currentFilterConfigState',
//   default: null
// });

// export const isInitialLoadState = atomFamily<boolean, ResourceKey>({
//   key: 'isInitialLoadState',
//   default: true,
// });


// export const isModifiedState = selectorFamily<boolean, ResourceKey>({
//   key: 'isModifiedState',
//   get: (resourceKey) => ({ get }) => {
//     const initialConfig = get(initialFilterConfigState(resourceKey));
//     const currentConfig = get(currentFilterConfigState(resourceKey));
//     const initialViewName = get(innitialViewNameState(resourceKey))
//     const currentViewName = get(currentViewNameState(resourceKey))

//     if (!initialConfig || !currentConfig || !currentViewName || !initialViewName) {
//       return false;
//     }
//     return (JSON.stringify(initialConfig) !== JSON.stringify(currentConfig) || currentViewName !== initialViewName);
//   },
// });
