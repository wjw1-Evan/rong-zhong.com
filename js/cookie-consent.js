// Cookie 同意管理器
class CookieConsentManager {
    constructor() {
        this.cookieConsent = this.getCookieConsent();
        this.init();
    }

    init() {
        // 移除 Cookie 同意横幅功能
    }

    // 获取 Cookie 同意状态
    getCookieConsent() {
        return JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    }

    // 保存 Cookie 同意状态
    saveCookieConsent(preferences) {
        localStorage.setItem('cookieConsent', JSON.stringify(preferences));
        this.cookieConsent = preferences;
    }

    // 显示 Cookie 同意横幅
    showConsentBanner() {
        // 已禁用：不再显示 Cookie 同意横幅
    }

    // 隐藏横幅
    hideBanner(banner) {
        banner.style.animation = 'slideDown 0.5s forwards';
        setTimeout(() => banner.remove(), 500);
    }

    // 显示自定义设置模态框
    showCustomizeModal() {
        // 已禁用：不再显示 Cookie 设置模态框
    }

    // 保存用户偏好设置
    savePreferences(modal) {
        const preferences = {
            necessary: true,
            performance: modal.querySelector('input[name="performance"]').checked,
            functional: modal.querySelector('input[name="functional"]').checked,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 接受所有 Cookie
    acceptAll() {
        const preferences = {
            necessary: true,
            performance: true,
            functional: true,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 仅接受必要的 Cookie
    acceptNecessary() {
        const preferences = {
            necessary: true,
            performance: false,
            functional: false,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 应用 Cookie 偏好设置
    applyPreferences(preferences) {
        // 必要的 Cookie 总是启用
        if (!preferences.performance) {
            // 禁用性能相关的 Cookie 和跟踪
            this.disablePerformanceCookies();
        }
        if (!preferences.functional) {
            // 禁用功能性 Cookie
            this.disableFunctionalCookies();
        }
    }

    // 禁用性能相关的 Cookie
    disablePerformanceCookies() {
        // 实现禁用性能跟踪的逻辑
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'disablePerformanceCookies'
        });
    }

    // 禁用功能性 Cookie
    disableFunctionalCookies() {
        // 实现禁用功能性 Cookie 的逻辑
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'disableFunctionalCookies'
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 已禁用：不再监听 Cookie 设置按钮
    }
}

// 初始化 Cookie 同意管理器
document.addEventListener('DOMContentLoaded', () => {
    window.cookieManager = new CookieConsentManager();
}); 