import { useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  UIManager,
  type HostInstance,
} from 'react-native';

/**
 * Hook que faz scroll manual do input focado para cima quando o teclado sobe
 * no Android. Mesmo padrão usado pelo componente Modal do projeto.
 *
 * Retorna:
 * - scrollRef: ref para atribuir ao <ScrollView ref={scrollRef}>
 * - handleFocusCapture: handler para atribuir em cada <TextInput onFocusCapture={handleFocusCapture}>
 * - handleContentSizeChange: handler para atribuir ao <ScrollView onContentSizeChange={handleContentSizeChange}>
 */
export function useKeyboardScroll() {
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const focusedInput = useRef<HostInstance | null>(null);
  const keyboardScreenY = useRef<number | null>(null);
  const scrollOffset = useRef(0);
  const scrollFocusedInputAfterLayout = useRef(false);

  const scrollFocusedInputIntoView = useCallback(() => {
    const target = focusedInput.current;
    const screenY = keyboardScreenY.current;
    const scrollView = scrollRef.current;
    if (target == null || screenY == null || !scrollView) return;

    const onInputMeasured = (
      _x: number,
      inputY: number,
      _width: number,
      inputHeight: number,
    ) => {
      scrollView.measureInWindow((_scrollX, scrollY, _scrollWidth, scrollHeight) => {
        const visibleTop = scrollY + 12;
        const visibleBottom = Math.min(scrollY + scrollHeight, screenY) - 12;
        const inputBottom = inputY + inputHeight;
        const adjustment =
          inputBottom > visibleBottom
            ? inputBottom - visibleBottom
            : inputY < visibleTop
              ? inputY - visibleTop
              : 0;

        if (adjustment === 0) return;
        scrollView.scrollTo({
          y: Math.max(0, scrollOffset.current + adjustment),
          animated: true,
        });
      });
    };

    if (typeof target === 'number') {
      UIManager.measureInWindow(target, onInputMeasured);
    } else {
      target.measureInWindow(onInputMeasured);
    }
  }, []);

  const handleFocusCapture = useCallback(
    (event: any) => {
      if (!keyboardScreenY.current || Platform.OS !== 'android') return;
      focusedInput.current = event.nativeEvent.target ?? null;
      requestAnimationFrame(scrollFocusedInputIntoView);
    },
    [scrollFocusedInputIntoView],
  );

  const handleContentSizeChange = useCallback(() => {
    if (!scrollFocusedInputAfterLayout.current) return;
    scrollFocusedInputAfterLayout.current = false;
    requestAnimationFrame(scrollFocusedInputIntoView);
  }, [scrollFocusedInputIntoView]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardScreenY.current = event.endCoordinates.screenY;
      scrollFocusedInputAfterLayout.current = true;
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardScreenY.current = null;
      scrollFocusedInputAfterLayout.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    scrollRef,
    handleFocusCapture,
    handleContentSizeChange,
  };
}
