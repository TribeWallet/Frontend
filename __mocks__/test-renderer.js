// Mock do test-renderer compatível com @testing-library/react-native v14 e React 19
// Nao usa o react-test-renderer (que nao funciona em Jest com root/toJSON inacessiveis).
// Em vez disso, chama o componente diretamente com hooks mockados (useState, useCallback)
// e percorre a arvore JSX retornada para construir nos navegaveis por consulta.
// Expõe a API createRoot/container que o RTL-RN v14 espera.
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;
const React = require('react');

// Guardar hooks originais
const originalHooks = {
  useState: React.useState,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useRef: React.useRef,
  useEffect: React.useEffect,
  useLayoutEffect: React.useLayoutEffect,
  useImperativeHandle: React.useImperativeHandle,
  useDebugValue: React.useDebugValue,
  useDeferredValue: React.useDeferredValue,
  useTransition: React.useTransition,
  useId: React.useId,
  useSyncExternalStore: React.useSyncExternalStore,
  useInsertionEffect: React.useInsertionEffect,
};

// Estado simples para useState fora do ambiente React
let componentStates = null;
let stateIndex = 0;

function mockUseState(initialValue) {
  if (!componentStates) {
    componentStates = [];
    stateIndex = 0;
  }
  const index = stateIndex++;
  if (index >= componentStates.length) {
    componentStates.push(
      typeof initialValue === 'function' ? initialValue() : initialValue,
    );
  }
  const setter = (value) => {
    componentStates[index] =
      typeof value === 'function' ? value(componentStates[index]) : value;
  };
  return [componentStates[index], setter];
}

function mockUseCallback(callback) {
  return callback;
}

function mockUseMemo(factory) {
  return factory();
}

function mockUseRef(initialValue) {
  return { current: initialValue };
}

function mockUseEffect() {}
function mockUseLayoutEffect() {}
function mockUseImperativeHandle() {}
function mockUseDebugValue() {}
function mockUseDeferredValue(value) {
  return value;
}
function mockUseTransition() {
  return [false, () => {}];
}
function mockUseId() {
  return '';
}
function mockUseSyncExternalStore(subscribe, getSnapshot) {
  return getSnapshot();
}
function mockUseInsertionEffect() {}

function applyMockHooks() {
  React.useState = mockUseState;
  React.useCallback = mockUseCallback;
  React.useMemo = mockUseMemo;
  React.useRef = mockUseRef;
  React.useEffect = mockUseEffect;
  React.useLayoutEffect = mockUseLayoutEffect;
  React.useImperativeHandle = mockUseImperativeHandle;
  React.useDebugValue = mockUseDebugValue;
  React.useDeferredValue = mockUseDeferredValue;
  React.useTransition = mockUseTransition;
  React.useId = mockUseId;
  React.useSyncExternalStore = mockUseSyncExternalStore;
  React.useInsertionEffect = mockUseInsertionEffect;
}

function restoreHooks() {
  React.useState = originalHooks.useState;
  React.useCallback = originalHooks.useCallback;
  React.useMemo = originalHooks.useMemo;
  React.useRef = originalHooks.useRef;
  React.useEffect = originalHooks.useEffect;
  React.useLayoutEffect = originalHooks.useLayoutEffect;
  React.useImperativeHandle = originalHooks.useImperativeHandle;
  React.useDebugValue = originalHooks.useDebugValue;
  React.useDeferredValue = originalHooks.useDeferredValue;
  React.useTransition = originalHooks.useTransition;
  React.useId = originalHooks.useId;
  React.useSyncExternalStore = originalHooks.useSyncExternalStore;
  React.useInsertionEffect = originalHooks.useInsertionEffect;
}

// Criar um no navegavel a partir de um elemento JSX (host element ou fragment)
// children pode conter strings (texto) e objetos node (elementos filhos)
function createNode(type, props, children, parent) {
  const node = {
    type,
    props,
    children,
    parent,
    findAll(predicate) {
      const results = [];
      const visit = (n) => {
        if (typeof n === 'object' && n !== null && predicate(n)) {
          results.push(n);
        }
        if (n && n.children) {
          for (const c of n.children) {
            visit(c);
          }
        }
      };
      visit(node);
      return results;
    },
    find(predicate) {
      const results = node.findAll(predicate);
      return results[0] || null;
    },
    findByType(type) {
      return node.find((i) => i.type === type);
    },
    findAllByType(type) {
      return node.findAll((i) => i.type === type);
    },
    findByProps(props) {
      return node.find((i) => {
        for (const k in props) {
          if (i.props[k] !== props[k]) return false;
        }
        return true;
      });
    },
    findAllByProps(props) {
      return node.findAll((i) => {
        for (const k in props) {
          if (i.props[k] !== props[k]) return false;
        }
        return true;
      });
    },
    toJSON() {
      return {
        type,
        props,
        children: children.map((c) =>
          typeof c === 'string' ? c : c.toJSON(),
        ),
      };
    },
  };
  // Vincular parent nos nos filhos (apenas objetos, nao strings)
  for (const child of children) {
    if (child && typeof child === 'object' && child.parent === undefined) {
      child.parent = node;
    }
  }
  node.parent = parent;
  return node;
}

// Percorrer um elemento JSX e construir a arvore de nos navegaveis
function renderElement(element, parent = null) {
  if (!element) return null;

  // Nós de texto (string/numero) -> mantidos como string pura na arvore
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }

  // null, undefined, true, false
  if (element == null || element === true || element === false) {
    return null;
  }

  const type = element.type;
  const props = element.props || {};

  // Resolver tipo de componente (forwardRef, memo retornam objetos, nao funcoes)
  let resolvedType = type;
  let isForwardRef = false;
  if (type && typeof type === 'object') {
    if (type.$$typeof === Symbol.for('react.forward_ref')) {
      resolvedType = type.render;
      isForwardRef = true;
    } else if (type.$$typeof === Symbol.for('react.memo')) {
      resolvedType = type.type;
    } else {
      // Tipo de objeto desconhecido
      return null;
    }
  }

  // React.Fragment
  if (
    resolvedType === React.Fragment ||
    resolvedType === Symbol.for('react.fragment')
  ) {
    const children = [];
    const rawChildren = props.children || [];
    const childArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
    for (const child of childArray) {
      const childNode = renderElement(child, null);
      if (childNode !== null && childNode !== undefined) {
        children.push(childNode);
      }
    }
    return createNode('fragment', {}, children, parent);
  }

  // Funcao de componente (inclui forwardRef.render, memo.type)
  if (typeof resolvedType === 'function') {
    // Reset estado para este componente
    componentStates = [];
    stateIndex = 0;

    // Substituir hooks temporariamente
    applyMockHooks();

    try {
      const rendered = isForwardRef ? resolvedType(props, null) : resolvedType(props);
      return renderElement(rendered, parent);
    } finally {
      // Restaurar hooks
      restoreHooks();
      componentStates = null;
      stateIndex = 0;
    }
  }

  // Elemento de host (tipo string)
  if (typeof resolvedType === 'string') {
    const children = [];
    const rawChildren = props.children || [];
    const childArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
    for (const child of childArray) {
      const childNode = renderElement(child, null);
      if (childNode !== null && childNode !== undefined) {
        children.push(childNode);
      }
    }
    return createNode(resolvedType, props, children, parent);
  }

  // Tipo desconhecido
  return null;
}

function emptyContainer() {
  return {
    queryAll: () => [],
    toJSON: () => null,
  };
}

function buildContainerFromElement(element) {
  const rootInstance = renderElement(element, null);
  return {
    queryAll(predicate, opts = {}) {
      if (!rootInstance) return [];
      const results = rootInstance.findAll(predicate);
      if (opts.matchDeepestOnly) {
        const deepest = [];
        for (const node of results) {
          let hasAncestorMatch = false;
          let p = node.parent;
          while (p) {
            if (typeof p === 'object' && predicate(p)) {
              hasAncestorMatch = true;
              break;
            }
            p = p.parent;
          }
          if (!hasAncestorMatch) deepest.push(node);
        }
        return deepest;
      }
      return results;
    },
    toJSON() {
      return rootInstance ? rootInstance.toJSON() : null;
    },
  };
}

// --- createRoot (API moderna usada pelo @testing-library/react-native v14) ---
function createRoot(options = {}) {
  let container = null;

  function render(element) {
    // render e sincrono; o container e definido imediatamente.
    // O RTL-RN chama await act(() => renderer.render(ui)) e depois acessa renderer.container.
    container = buildContainerFromElement(element);
    return {
      get container() {
        return container;
      },
      container,
      rerender: (newEl) => {
        container = buildContainerFromElement(newEl);
      },
      unmount: () => {
        container = emptyContainer();
      },
      toJSON: () => (container ? container.toJSON() : null),
      debug: () => '',
      get root() {
        return container;
      },
    };
  }

  return {
    get container() {
      return container;
    },
    render,
    unmount: () => {
      container = emptyContainer();
    },
  };
}

// --- create (API clássica do react-test-renderer) ---
function create(element, options) {
  const rootInstance = renderElement(element, null);
  if (!rootInstance) {
    return {
      toJSON: () => null,
      toTree: () => null,
      update: () => {},
      unmount: () => {},
      getInstance: () => null,
      root: {
        queryAll: () => [],
        find: () => null,
        findByType: () => null,
        findAllByType: () => [],
        findByProps: () => null,
        findAllByProps: () => [],
      },
    };
  }
  const container = buildContainerFromElement(element);
  return {
    toJSON: () => container.toJSON(),
    toTree: () => null,
    update: (newElement) => {
      container = buildContainerFromElement(newElement);
    },
    unmount: () => {},
    getInstance: () => null,
    root: {
      queryAll: (predicate) => rootInstance.findAll(predicate),
      find: (predicate) => {
        const results = rootInstance.findAll(predicate);
        return results[0] || null;
      },
      findByType: (type) => {
        const results = rootInstance.findAll((i) => i.type === type);
        return results[0] || null;
      },
      findAllByType: (type) => rootInstance.findAll((i) => i.type === type),
      findByProps: (props) => {
        const results = rootInstance.findAll((i) => {
          for (const k in props) {
            if (i.props[k] !== props[k]) return false;
          }
          return true;
        });
        return results[0] || null;
      },
      findAllByProps: (props) => {
        const results = rootInstance.findAll((i) => {
          for (const k in props) {
            if (i.props[k] !== props[k]) return false;
          }
          return true;
        });
        return results;
      },
    },
  };
}

module.exports = {
  createRoot,
  create,
  act: (cb) => cb(),
  version: '19.0.0',
};
