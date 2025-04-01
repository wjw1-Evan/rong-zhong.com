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
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 初始化性能监控
        Analytics.init();

        // 处理图片加载
        handleImageLoad();

        // 激活当前页面的导航链接
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        DOM.navLinks?.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        handleError(error, 'DOMContentLoaded handling');
    }
});

// 处理平滑滚动
try {
    document.querySelectorAll('.service-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement && DOM.nav) {
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - DOM.nav.offsetHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
} catch (error) {
    handleError(error, 'Smooth scroll handling');
}

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

// 性能监控
const performanceMonitor = {
    init() {
        // 创建性能进度条
        this.createProgressBar();
        // 监听页面加载事件
        window.addEventListener('load', () => this.handlePageLoad());
        // 监听资源加载事件
        window.addEventListener('DOMContentLoaded', () => this.handleDOMContentLoaded());
    },

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        document.body.appendChild(progressBar);
        this.progressBar = progressBar;
    },

    handlePageLoad() {
        this.progressBar.classList.add('loading');
        setTimeout(() => {
            this.progressBar.classList.remove('loading');
        }, 500);
    },

    handleDOMContentLoaded() {
        // 添加页面加载动画
        document.querySelectorAll('.feature-card, .service-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fadeInUp');
        });
    }
};

// 图片懒加载
const lazyLoadImages = {
    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
};

// 平滑滚动
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

// 移动端菜单优化
const mobileMenu = {
    init() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // 点击导航链接后关闭菜单
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
            });
        }
    }
};

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

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor.init();
    lazyLoadImages.init();
    smoothScroll.init();
    mobileMenu.init();
    formOptimization.init();
}); 