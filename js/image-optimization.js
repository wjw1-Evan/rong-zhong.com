// 图片优化配置
const imageOptimization = {
    init() {
        this.checkWebPSupport();
        this.setupResponsiveImages();
        this.initializeLazyLoading();
    },

    // 检查浏览器是否支持WebP
    checkWebPSupport() {
        const webP = new Image();
        webP.onload = function () {
            const isSupported = (webP.width > 0) && (webP.height > 0);
            document.documentElement.classList.add(isSupported ? 'webp' : 'no-webp');
        };
        webP.onerror = function () {
            document.documentElement.classList.add('no-webp');
        };
        webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    },

    // 设置响应式图片
    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-srcset]');
        images.forEach(img => {
            const srcset = img.dataset.srcset;
            if (srcset) {
                img.srcset = srcset;
            }
        });
    },

    // 初始化懒加载
    initializeLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // 原生懒加载支持
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // 降级处理：使用 Intersection Observer
            this.setupIntersectionObserver();
        }
    },

    // 设置 Intersection Observer
    setupIntersectionObserver() {
        const config = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };

        const observer = new IntersectionObserver((entries, self) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    self.unobserve(entry.target);
                }
            });
        }, config);

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    },

    // 加载图片
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 预加载图片
        const preloadImage = new Image();
        preloadImage.onload = function () {
            img.src = src;
            img.classList.add('loaded');
        };
        preloadImage.src = src;

        // 清理 data 属性
        img.removeAttribute('data-src');
    },

    // 转换图片为 WebP（如果支持）
    convertToWebP(imagePath) {
        if (document.documentElement.classList.contains('webp')) {
            return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        return imagePath;
    }
};

// 导出模块
export default imageOptimization; 