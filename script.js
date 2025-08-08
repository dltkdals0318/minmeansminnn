class PigeonFrameController {
    constructor() {
        this.canvas = document.getElementById('pigeonCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.frames = [];
        this.totalFrames = 125; // pigeon0000.png ~ pigeon0124.png
        this.currentFrame = 0;
        this.isLoaded = false;
        this.loadedFrames = 0;
        
        this.init();
    }
    
    async init() {
        console.log('Loading pigeon frames...');
        await this.loadAllFrames();
        this.setupCanvas();
        this.bindEvents();
        console.log('Pigeon frames loaded successfully!');
    }
    
    async loadAllFrames() {
        const loadPromises = [];
        
        for (let i = 0; i < this.totalFrames; i++) {
            const frameNumber = i.toString().padStart(4, '0'); // 0000, 0001, 0002...
            const framePath = `source/image_sequence/pigeon${frameNumber}.png`;
            
            loadPromises.push(this.loadFrame(framePath, i));
        }
        
        await Promise.all(loadPromises);
        this.isLoaded = true;
    }
    
    loadFrame(src, index) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.frames[index] = img;
                this.loadedFrames++;
                
                // 로딩 진행률 출력 (선택사항)
                if (this.loadedFrames % 20 === 0 || this.loadedFrames === this.totalFrames) {
                    console.log(`Loaded ${this.loadedFrames}/${this.totalFrames} frames`);
                }
                
                // 첫 번째 프레임이 로드되면 캔버스 크기 설정
                if (index === 0) {
                    this.setupCanvas();
                    this.renderFrame(); // 첫 프레임 바로 표시
                }
                
                resolve();
            };
            
            img.onerror = () => {
                console.error(`Failed to load frame: ${src}`);
                reject(new Error(`Failed to load frame: ${src}`));
            };
            
            img.src = src;
        });
    }
    
    setupCanvas() {
        if (this.frames[0]) {
            const firstFrame = this.frames[0];
            this.canvas.width = firstFrame.naturalWidth;
            this.canvas.height = firstFrame.naturalHeight;
            
            // CSS로 실제 표시 크기는 100% 유지
            this.canvas.style.width = '100%';
            this.canvas.style.height = 'auto';
        }
    }
    
    bindEvents() {
        // 마우스 이동 이벤트
        document.addEventListener('mousemove', (e) => {
            this.updateFrameByMousePosition(e.clientX);
        });
        
        // 터치 이벤트 (모바일 지원)
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateFrameByMousePosition(touch.clientX);
        });
        
        // 윈도우 리사이즈
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.renderFrame();
        });
        
        // 마우스가 화면을 벗어날 때 첫 프레임으로
        document.addEventListener('mouseleave', () => {
            this.currentFrame = 0;
            this.renderFrame();
        });
    }
    
    updateFrameByMousePosition(mouseX) {
        if (!this.isLoaded) return;
        
        // 브라우저 창 전체 너비 기준으로 0-1 범위로 정규화
        const normalizedX = Math.max(0, Math.min(1, mouseX / window.innerWidth));
        
        // 프레임 인덱스 계산 (0 ~ 155)
        const targetFrame = Math.floor(normalizedX * (this.totalFrames - 1));
        
        // 프레임이 변경된 경우에만 렌더링
        if (targetFrame !== this.currentFrame) {
            this.currentFrame = targetFrame;
            this.renderFrame();
            
            // 디버깅용 로그 (필요시 주석 해제)
            // console.log(`Mouse: ${mouseX}px, Window: ${window.innerWidth}px, Normalized: ${normalizedX.toFixed(3)}, Frame: ${targetFrame}`);
        }
    }
    
    renderFrame() {
        if (!this.frames[this.currentFrame]) return;
        
        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 현재 프레임 그리기
        this.ctx.drawImage(
            this.frames[this.currentFrame], 
            0, 0, 
            this.canvas.width, 
            this.canvas.height
        );
    }
    
    // 디버깅용: 특정 프레임으로 점프
    jumpToFrame(frameNumber) {
        if (frameNumber >= 0 && frameNumber < this.totalFrames) {
            this.currentFrame = frameNumber;
            this.renderFrame();
        }
    }
    
    // 현재 상태 확인
    getStatus() {
        return {
            totalFrames: this.totalFrames,
            loadedFrames: this.loadedFrames,
            currentFrame: this.currentFrame,
            isLoaded: this.isLoaded
        };
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.pigeonController = new PigeonFrameController();
    
    // 디버깅용 전역 함수들
    window.jumpToFrame = (frame) => window.pigeonController.jumpToFrame(frame);
    window.getStatus = () => window.pigeonController.getStatus();
});