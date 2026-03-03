/**
 * 统一滚动管理器 (ScrollManager)
 * 处理全站的鼠标滚轮、导航点击和 ScrollSpy 逻辑
 */
class ScrollManager {
    constructor() {
        this.isScrolling = false;
        this.sections = [];
        this.currentIndex = 0;
        this.navLinks = [];
        this.scrollLockTime = 800; // 锁定时间 (ms)
        this.init();
    }

    init() {
        if (this.isMobile()) return;

        // 获取断面和导航链接
        this.updateElements();

        // 覆盖原生滚动
        document.documentElement.style.scrollBehavior = 'auto';

        // 核心事件监听
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        window.addEventListener('keydown', (e) => this.handleKeydown(e));
        window.addEventListener('resize', () => this.updateElements());
        window.addEventListener('scroll', () => this.updateActiveLink());

        // 处理所有点击事件 (由 .side-nav 或 .nav-links 触发)
        this.bindClickEvents();
    }

    isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (window.innerWidth <= 768);
    }

    updateElements() {
        // 查找所有目标断面 (从 side-nav 或 main-nav 中提取)
        const allNavLinks = document.querySelectorAll('.side-nav .nav-link, .nav-links a[href^="#"]');
        const ids = Array.from(allNavLinks).map(link => link.getAttribute('href').replace('#', ''));
        const uniqueIds = [...new Set(ids)];

        this.sections = uniqueIds
            .map(id => document.getElementById(id))
            .filter(el => el !== null)
            .sort((a, b) => a.offsetTop - b.offsetTop);

        this.navLinks = Array.from(allNavLinks);
        this.updateCurrentIndex();
    }

    bindClickEvents() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.getElementById(targetId.substring(1));
                    if (targetElement) {
                        const index = this.sections.indexOf(targetElement);
                        if (index !== -1) this.scrollTo(index);
                    }
                }
            });
        });
    }

    updateActiveLink() {
        if (this.isScrolling) return;

        const scrollPos = window.scrollY + 150;
        let activeId = '';

        this.sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                activeId = section.getAttribute('id');
            }
        });

        if (activeId) {
            this.navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
            });
        }
    }

    updateCurrentIndex() {
        const scrollPos = window.scrollY + 100;
        let index = 0;
        for (let i = 0; i < this.sections.length; i++) {
            if (scrollPos >= this.sections[i].offsetTop) {
                index = i;
            }
        }
        this.currentIndex = index;
    }

    handleWheel(e) {
        if (this.sections.length < 2 || this.isScrolling || e.ctrlKey || e.metaKey) return;

        // 仅在以下情况拦截并触发断面跳转：
        // 1. 在首页第一屏 (Index 0) 向下滚 -> 跳到第二屏
        // 2. 在第二屏 (Index 1) 且处于顶部区域，向上滚 -> 跳回首页

        const isIndex0 = this.currentIndex === 0;
        const isIndex1 = this.currentIndex === 1;
        const isAtTop = window.scrollY <= this.sections[1]?.offsetTop + 5; // 允许一丁点误差

        if (isIndex0 && e.deltaY > 0) {
            e.preventDefault();
            this.scrollNext();
        } else if (isIndex1 && isAtTop && e.deltaY < 0) {
            e.preventDefault();
            this.scrollPrev();
        }
        // 其他情况（如在第二屏向下滚，或在第三屏向上滚）保持原生滚动
    }

    handleKeydown(e) {
        if (this.sections.length < 2 || this.isScrolling) return;

        const isIndex0 = this.currentIndex === 0;
        const isIndex1 = this.currentIndex === 1;
        const isAtTop = window.scrollY <= this.sections[1]?.offsetTop + 5;

        if (isIndex0 && (e.key === 'ArrowDown' || e.key === 'PageDown')) {
            e.preventDefault();
            this.scrollNext();
        } else if (isIndex1 && isAtTop && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
            e.preventDefault();
            this.scrollPrev();
        }
    }

    scrollNext() {
        if (this.currentIndex < this.sections.length - 1) {
            this.scrollTo(this.currentIndex + 1);
        }
    }

    scrollPrev() {
        if (this.currentIndex > 0) {
            this.scrollTo(this.currentIndex - 1);
        }
    }

    scrollTo(index) {
        this.isScrolling = true;
        this.currentIndex = index;
        const targetSection = this.sections[index];

        // 统一动画：使用与点击相同的 smooth behavior
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // 手动更新高亮 (防止平滑滚动中途还没到位置)
        const activeId = targetSection.getAttribute('id');
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });

        setTimeout(() => {
            this.isScrolling = false;
        }, this.scrollLockTime);
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM 元素缓存
const DOM = {
    menuToggle: document.querySelector('.menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    backToTop: document.querySelector('.back-to-top'),
    nav: document.querySelector('nav'),
    features: document.querySelector('#features'),
    images: document.querySelectorAll('img[loading="lazy"]')
};

// 性能监控和错误上报
const Analytics = {
    init() {
        // 监控页面性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

                console.log('页面加载时间:', pageLoadTime + 'ms');
                console.log('DOM准备时间:', domReadyTime + 'ms');

                // 可以在这里添加性能数据上报逻辑
                this.sendAnalytics('performance', {
                    pageLoadTime,
                    domReadyTime
                });
            }, 0);
        });

        // 监控JS错误
        window.addEventListener('error', (event) => {
            const errorData = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            };

            // 错误上报
            this.sendAnalytics('error', errorData);
        });

        // 监控资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target.tagName) {
                const resourceData = {
                    type: event.target.tagName.toLowerCase(),
                    url: event.target.src || event.target.href,
                    message: '资源加载失败'
                };

                // 资源错误上报
                this.sendAnalytics('resource_error', resourceData);
            }
        }, true);
    },

    sendAnalytics(type, data) {
        // 这里可以替换为实际的数据上报接口
        console.log('Analytics:', type, data);

        // 示例：发送到服务器
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         type,
        //         data,
        //         timestamp: new Date().toISOString()
        //     })
        // }).catch(console.error);
    }
};


// 错误处理函数
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // 使用Analytics上报错误
    Analytics.sendAnalytics('error', {
        context,
        message: error.message,
        stack: error.stack
    });
}

// 移动端菜单处理
try {
    if (DOM.menuToggle && DOM.navLinks) {
        // 点击菜单按钮时的处理
        DOM.menuToggle.addEventListener('click', () => {
            DOM.menuToggle.classList.toggle('active');
            DOM.navLinks.classList.toggle('active');
        });

        // 点击导航链接时关闭菜单
        DOM.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                DOM.menuToggle.classList.remove('active');
                DOM.navLinks.classList.remove('active');
            });
        });

        // 点击页面其他区域时关闭菜单
        document.addEventListener('click', (e) => {
            if (!DOM.menuToggle.contains(e.target) && !DOM.navLinks.contains(e.target)) {
                DOM.menuToggle.classList.remove('active');
                DOM.navLinks.classList.remove('active');
            }
        });
    }
} catch (error) {
    handleError(error, 'Mobile menu handling');
}

// 滚动处理
try {
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown && DOM.features) {
        scrollDown.addEventListener('click', (event) => {
            event.preventDefault();
            DOM.features.scrollIntoView({ behavior: 'smooth' });
        });
    }
} catch (error) {
    handleError(error, 'Scroll down handling');
}

// 图片加载处理
function handleImageLoad() {
    try {
        DOM.images.forEach(img => {
            if (!img.complete) {
                img.style.opacity = '0';
                img.addEventListener('load', function () {
                    this.style.opacity = '0';
                    this.classList.add('loaded');
                    requestAnimationFrame(() => {
                        this.style.opacity = '1';
                    });
                });

                img.addEventListener('error', function () {
                    // 图片加载失败时的处理
                    Analytics.sendAnalytics('image_error', {
                        src: this.src,
                        alt: this.alt
                    });
                });
            } else {
                img.classList.add('loaded');
                img.style.opacity = '1';
            }
        });
    } catch (error) {
        handleError(error, 'Image loading');
    }
}

// 页面加载完成后的处理
// 合并DOMContentLoaded事件监听，移除未定义对象初始化
// 并优化图片DOM获取

document.addEventListener('DOMContentLoaded', () => {
    // 启动统一滚动管理器
    window.scrollManager = new ScrollManager();

    try {
        // 初始化性能监控
        Analytics.init();
        // 处理图片加载（每次都重新获取图片）
        DOM.images = document.querySelectorAll('img[loading="lazy"]');
        handleImageLoad();
        // 激活当前页面的导航链接
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        DOM.navLinks?.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
        // 注释掉未定义对象初始化
        // performanceMonitor.init();
        // lazyLoadImages.init();
        // smoothScroll.init();
        // mobileMenu.init();
        // formOptimization.init(); // 若formOptimization已定义可保留
    } catch (error) {
        handleError(error, 'DOMContentLoaded handling');
    }
});

// 已由 ScrollManager 统一处理
/*
try {
    document.querySelectorAll('.service-link').forEach(anchor => {
        ...
    });
} catch (error) {
    handleError(error, 'Smooth scroll handling');
}
*/

// 回到顶端按钮处理 - 使用防抖
if (DOM.backToTop) {
    try {
        // 显示/隐藏回到顶端按钮
        const handleScroll = debounce(() => {
            if (window.scrollY > 300) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);

        // 点击回到顶端按钮
        DOM.backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } catch (error) {
        handleError(error, 'Back to top handling');
    }
}

// 表单验证和优化
const formOptimization = {
    init() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.addFormValidation(form);
        });
    },

    addFormValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.validateInput(input));
        });
    },

    validateInput(input) {
        const value = input.value.trim();
        const isValid = value.length > 0;

        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid && value.length > 0);

        return isValid;
    },

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            // 这里添加表单提交逻辑
            console.log('Form submitted successfully');
        }
    }
};

// 移除冗余的 DOMContentLoaded 监听器，因为 190 行已经有一个了
