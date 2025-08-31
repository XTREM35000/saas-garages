import { useCallback, useEffect, useState } from 'react';

interface DragConstraints {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

interface BreakpointConstraints {
  sm: DragConstraints;
  md: DragConstraints;
  lg: DragConstraints;
  xl: DragConstraints;
}

const defaultConstraints: DragConstraints = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

const defaultBreakpointConstraints: BreakpointConstraints = {
  sm: { top: -50, left: -50, right: 50, bottom: 50 },
  md: { top: -100, left: -100, right: 100, bottom: 100 },
  lg: { top: -150, left: -150, right: 150, bottom: 150 },
  xl: { top: -200, left: -200, right: 200, bottom: 200 }
};

export function useResponsiveDragConstraints(): DragConstraints {
  const [constraints, setConstraints] = useState<DragConstraints>(defaultConstraints);

  const updateConstraints = useCallback(() => {
    const width = window.innerWidth;
    
    let newConstraints: DragConstraints;
    
    if (width < 640) {
      newConstraints = defaultBreakpointConstraints.sm;
    } else if (width < 768) {
      newConstraints = defaultBreakpointConstraints.md;
    } else if (width < 1024) {
      newConstraints = defaultBreakpointConstraints.lg;
    } else {
      newConstraints = defaultBreakpointConstraints.xl;
    }
    
    setConstraints(newConstraints);
  }, []);

  useEffect(() => {
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    
    return () => {
      window.removeEventListener('resize', updateConstraints);
    };
  }, [updateConstraints]);

  return constraints;
}

export function useBreakpointDragConstraints(
  customConstraints?: Partial<BreakpointConstraints>
): DragConstraints {
  const [constraints, setConstraints] = useState<DragConstraints>(defaultConstraints);

  const breakpointConstraints = {
    ...defaultBreakpointConstraints,
    ...customConstraints
  };

  const updateConstraints = useCallback(() => {
    const width = window.innerWidth;
    
    let newConstraints: DragConstraints;
    
    if (width < 640) {
      newConstraints = breakpointConstraints.sm;
    } else if (width < 768) {
      newConstraints = breakpointConstraints.md;
    } else if (width < 1024) {
      newConstraints = breakpointConstraints.lg;
    } else {
      newConstraints = breakpointConstraints.xl;
    }
    
    setConstraints(newConstraints);
  }, [breakpointConstraints]);

  useEffect(() => {
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    
    return () => {
      window.removeEventListener('resize', updateConstraints);
    };
  }, [updateConstraints]);

  return constraints;
}