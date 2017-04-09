class TouchHandler {
    public static SWIPE_DIRECTION = {
        "NO": 0,
        "UP": 1,
        "RIGHT": 2,
        "DOWN": 3,
        "LEFT": 4
    };

    public static MIN_SWIPE_DURATION = 120;
    public static MIN_SWIPE_DISTANCE = 120;

    public static swipeStartTime: number = 0;
    public static swipeStartPosition: any = {x: -1, y: -1};
    public static swipeEndPosition: any = {x: -1, y: -1};

    public static startTouch(event: TouchEvent): void {
        TouchHandler.swipeStartTime = (new Date()).getTime();

        TouchHandler.swipeStartPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };

        TouchHandler.swipeEndPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    public static moveTouch(event: TouchEvent): void {
        TouchHandler.swipeEndPosition.x = event.touches[0].clientX;
        TouchHandler.swipeEndPosition.y = event.touches[0].clientY;
    }

    public static endTouch(event: Touch): number {
        let swipeEndTime: number = (new Date()).getTime();

        let result = TouchHandler.SWIPE_DIRECTION.NO;
        let swipeDuration = (swipeEndTime - TouchHandler.swipeStartTime);
        let dx = TouchHandler.swipeStartPosition.x - TouchHandler.swipeEndPosition.x;
        let dy = TouchHandler.swipeStartPosition.y - TouchHandler.swipeEndPosition.y;

        if (swipeDuration > TouchHandler.MIN_SWIPE_DURATION 
            && (Math.abs(dx) > TouchHandler.MIN_SWIPE_DISTANCE 
            || Math.abs(dy) > TouchHandler.MIN_SWIPE_DISTANCE)) {

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    result = TouchHandler.SWIPE_DIRECTION.LEFT;
                } else {
                    result = TouchHandler.SWIPE_DIRECTION.RIGHT;
                }
            } else {
                if (dy > 0) {
                    result = TouchHandler.SWIPE_DIRECTION.UP;
                } else {
                    result = TouchHandler.SWIPE_DIRECTION.DOWN;
                }
            }
        }
        return result;
    }
}