//getElementById
function $(id) {
	return document.getElementById(id);
}
/**
 * Cookie操作
 */
var cookie = {
	//获取cookie
	get: function() {
		var cookieObj = {};
		var all = document.cookie;
		if (all === '') return cookieObj;
		var list = all.split('; ');
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var arr = item.split('=');
			var name = arr[0];
			var value = arr[1];
			name = decodeURIComponent(name);
			value = decodeURIComponent(value);
			cookieObj[name] = value;
		}
		return cookieObj;
	},
	//设置cookie
	set: function(name, value, expires, path, domain, secure) {
		var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
		if (expires) {
			cookie += '; expires=' + expires.toGMTString();
		}
		if (path) {
			cookie += '; path=' + path;
		}
		if (domain) {
			cookie += '; domain=' + domain;
		}
		if (secure) {
			cookie += '; secure=' + secure;
		}
		document.cookie = cookie;
	},
	//移除cookie
	remove: function(name, path, domain) {
		document.cookie = name + '=' + '; path=' + path + '; domain=' + domain + '; max-age=0';
	}
};
//设置返回一个月后的时间，用于设置cookie
function oneMonth() {
	var date = new Date();
	date.setMonth(date.getMonth() + 1);
	return date;
}
/**
 * ajax操作
 */
var ajax = function(opts) {
	//默认参数
	var defaults = {
		method: 'GET',
		url: '',
		data: '',
		async: true,
		contentType: 'application/x-www-form-urlencoded',
		success: function() {},
		error: function() {}
	};
	//参数更新
	for (var key in opts) {
		defaults[key] = opts[key];
	}
	//数据处理
	if (typeof defaults.data === 'object') {
		var str = '';
		for (var key in defaults.data) {
			str += key + '=' + defaults.data[key] + '&';
		}
		defaults.data = str.substring(0, str.length - 1);
	}

	defaults.method = defaults.method.toUpperCase();
	if (defaults.method === 'GET') {
		defaults.url += '?' + defaults.data;
	}
	//创建xhr
	var xhr = new XMLHttpRequest();
	//开启请求
	xhr.open(defaults.method, defaults.url, defaults.async);
	//发送请求
	if (defaults.method === 'GET') {
		xhr.send(null);
	} else {
		xhr.setRequestHeader("Content-type", defaults.contentType);
		xhr.send(defaults.data);
	}
	//等待响应
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status == 200) {
				defaults.success.call(xhr, [xhr.responseText]);
			} else {
				defaults.error.call(xhr, [xhr.status]);
			}
		}
	}
};
/**
 * 运动函数
 * @param {Object} obj 节点对象
 * @param {Object} attr 属性
 * @param {Object} itarget 目标值
 */
function move(obj, attr, itarget) {
	clearInterval(obj.timer);
	obj.timer = setInterval(function() {
		if (attr == "opacity") {
			cur = parseFloat(getStyle(obj, attr)) * 100;
			speed = 5;
			if (cur == itarget) {
				clearInterval(obj.timer);
			} else {
				cur += speed;
				obj.style.opacity = cur / 100;
				obj.style.filter = "alpha(opacity:" + cur + ")";
			}
		} else {
			cur = parseInt(getStyle(obj, attr));
			speed = (itarget - cur) / 20; //parseInt 获取的值转化为数
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //向下、向上取正

			if (cur == itarget) {
				clearInterval(obj.timer);
			} else {
				obj.style[attr] = cur + speed + "px";
			}
		}

	}, 25);
}

/**
 * 获取样式
 * @param {Object} obj 节点对象
 * @param {Object} attr 属性
 */
function getStyle(obj, attr) //getStyle 非行间属性  结果值为 ***px
{
	if (obj.currentStyle) {
		return obj.currentStyle[attr];
	} else {
		return getComputedStyle(obj, false)[attr];
	}
}
/*
 * class操作
 */
function hasClass(obj, cls) {
	return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
	if (!this.hasClass(obj, cls)) obj.className += " " + cls;
}

function removeClass(obj, cls) {
	if (hasClass(obj, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		obj.className = obj.className.replace(reg, ' ');
	}
}
//事件注册
function addEvent(obj, ev, fn) {
	if (obj.attachEvent) {
		obj.attachEvent('on' + ev, fn)
	} else {
		obj.addEventListener(ev, fn, false)
	}
}
//提示文字
function setText(obj, str) {
	obj.innerHTML = str;
	setTimeout(function() {
		obj.innerHTML = '';
	}, 3000);
}
//检查提醒状态
if (cookie.get().notTip !== 'yes') {
	document.querySelector('.g-hd-top').style.display = "block";
}
//检查登录状态及关注状态
if (cookie.get().loginSuc !== undefined && cookie.get().followSuc === 'yes') {
	var followBtn = $('followBtn');
	addClass(followBtn, 'z-dis');
	followBtn.getElementsByTagName('span')[0].innerHTML = '已关注';
}
/*
 * 事件绑定
 */
//不再提醒
addEvent($('notTip'), 'click', function() {
	cookie.set('notTip', 'yes', oneMonth());
	document.querySelector('.g-hd-top').style.display = 'none';
});

//关注模块
(function() {
	var followBtn = $('followBtn'),
		cancelBtn = $('cancelBtn');
	//关注
	addEvent(followBtn, 'click', function() {
		//判断是否已登录
		if (cookie.get().loginSuc !== undefined) {
			addClass(followBtn, 'z-dis');
			ajax({
				method: 'GET',
				url: 'http://study.163.com/webDev/attention.htm',
				success: function(data) {
					if (data == "1") {
						cookie.set('followSuc', 'yes', oneMonth());
						followBtn.getElementsByTagName('span')[0].innerHTML = '已关注';
					}
				},
				error: function(data) {
					console.log('关注失败:' + data);
				}
			});
		} else {
			document.querySelector('.m-popup').style.display = 'block';
		}
	});
	//取消关注
	addEvent(cancelBtn, 'click', function(e) {
		e.stopPropagation(); //阻止冒泡
		cookie.remove('followSuc', '', '');
		removeClass(followBtn, 'z-dis');
		followBtn.getElementsByTagName('span')[0].innerHTML = '关注';
	});
})();

//登录模块
(function() {
	var closePopup = $('closePopup'),
		loginBtn = $('loginBtn'),
		mess = $('loginMess');
	//关闭登录弹窗
	addEvent(closePopup, 'click', function() {
		document.querySelector('.m-popup').style.display = 'none';
		$('userName').value = '';
		$('password').value = '';
	});
	//登录
	addEvent(loginBtn, 'click', function() {
		var userName = $('userName').value,
			password = $('password').value;
		//防止连续点击登录
		var that = this;
		that.setAttribute('disabled', '');
		setTimeout(function() {
			that.removeAttribute('disabled');
		}, 2000);
		//判断输入框是否为空
		if (userName === '' || password === '') {
			setText(mess, '请输入帐号及密码');
		} else {
			userName = md5(userName);
			password = md5(password);
			ajax({
				method: 'GET',
				url: 'http://study.163.com/webDev/login.htm',
				data: {
					userName: userName,
					password: password
				},
				success: function(data) {
					if (data == 1) {
						closePopup.click();
						cookie.set('loginSuc', userName, oneMonth());
					} else {
						setText(mess, '帐号或密码错误')
					}
				},
				error: function(data) {
					console.log('登录失败:' + data);
				}
			});
		}
	});
	addEvent($('password'), 'keydown', function(e) {
		if (e.keyCode == 13) {
			loginBtn.click();
		}
	});
})();
//轮播图模块
(function() {
	var banner = $('banner'),
		slides = banner.getElementsByTagName('a'),
		control = $('control'),
		points,
		total = slides.length,
		index = -1,
		interval = 5000,
		timer = null;

	//一张图 不执行轮播
	if (total == 1) {
		next();
		return;
	}
	//创建指示器
	for (var i = 0; i < total; i++) {
		var pointer = document.createElement('i');
		control.appendChild(pointer);
	}
	points = control.getElementsByTagName('i');
	//切换到下一张图
	function next() {
		index++;
		index = index > total - 1 ? 0 : index;
		show(index);
	}
	//显示slide
	function show(i) {
		var cur = banner.querySelectorAll('.z-cur');
		for (var j = 0; j < cur.length; j++) {
			removeClass(cur[j], 'z-cur');
		}
		addClass(slides[i], 'z-cur');
		points && addClass(points[i], 'z-cur');
	}
	//自动播放
	function autoPlay() {
		if (timer) {
			clearInterval(timer);
		}
		timer = setInterval(function() {
			next();
		}, interval);
	}
	//指示器添加索引
	for (var i = 0; i < points.length; i++) {
		points[i].index = i;
	}
	//鼠标移入移出
	addEvent(banner, 'mouseenter', function() {
		if (timer) clearInterval(timer);
	});
	addEvent(banner, 'mouseleave', function() {
		autoPlay();
	});
	//点击
	addEvent(control, 'click', function(e) {
		var e = e || window.event;
		var target = e.target || e.srcElement;
		if (target.nodeName.toLowerCase() == 'i') {
			if (hasClass(target, 'z-cur')) return;
			var i = target.index;
			index = i;
			show(i);
		}
	});
	next();
	autoPlay();
})();
//照片墙模块
(function() {
	var slider = document.querySelector('.slider'),
		target = 0,
		timer = null;

	function autoPlay() {
		if (timer) {
			clearInterval(timer);
		}
		timer = setInterval(function() {
			target++;
			slider.style.left = -target + 'px';
			if (target === 1620) {
				target = 0;
			}
		}, 60);
	}
	autoPlay();
})();
//课程模块
(function() {
	var tab = $('tab'),
		tabBtn = tab.getElementsByTagName('div'),
		courseLists = $('courseList').querySelectorAll('.cl'),
		oCoursePage = $('coursePage'),
		aCoursePage = coursePage.getElementsByTagName('li'),
		prePage = $('prePage'),
		nextPage = $('nextPage');
	var curTab = 0; //当前tab,10为产品,20为编程
	var curPage = 0; //当前页码
	//添加索引
	for (var i = 0; i < tabBtn.length; i++) {
		tabBtn[i].index = i;
	}
	for (var i = 0; i < aCoursePage.length; i++) {
		//页码从1开始
		aCoursePage[i].index = i + 1;
	}
	//设置当前tab
	function setCur(obj, index) {
		var tabs = tab.getElementsByTagName('div');
		for (var i = 0; i < tabs.length; i++) {
			removeClass(tabs[i], 'z-cur');
			courseLists[i].style.display = 'none';
		}
		addClass(obj, 'z-cur');
		courseLists[index].style.display = 'block';
		curTab = index === 0 ? 10 : 20;
		pageLoad(curTab, 1);
	}
	//课程页加载
	function pageLoad(type, pageNo) {
		var curList = type === 10 ? courseLists[0] : courseLists[1];
		ajax({
			method: 'GET',
			url: 'http://study.163.com/webDev/couresByCategory.htm',
			data: {
				pageNo: pageNo,
				psize: 20,
				type: type
			},
			success: function(data) {
				console.log('Course list request succeed.');
				//将pageNo设为当前页
				if (curPage) removeClass(aCoursePage[curPage - 1], 'z-cur');
				addClass(aCoursePage[pageNo - 1], 'z-cur');
				curPage = pageNo;
				var info = JSON.parse(data); //转为js对象
				var list = info.list; //课程列表
				//清空课程列表
				curList.innerHTML = '';
				for (var i = 0; i < list.length; i++) {
					var price = list[i].price ? '￥' + list[i].price : '免费',
						categoryName = list[i].categoryName ? list[i].categoryName : '无';
					curList.innerHTML += '<div class="m-course"><img src="' + list[i].bigPhotoUrl + '"><p class="courseName">' + list[i].name + '</p><p class="provider">' + list[i].provider + '</p><span class="learnerCount">' + list[i].learnerCount + '</span><span class="price">' + price + '</span><div class="detail"><img src="' + list[i].bigPhotoUrl + '" /><h4>' + list[i].name + '</h4><span class="learnerCount">' + list[i].learnerCount + '人在学</span><p class="categoryName">发布者：' + list[i].provider + '<br />分类：' + categoryName + '</p><p class="description">' + list[i].description + '</p></div></div>';
				}
			},
			error: function(data) {
				console.log('Course list request failed, error stutas: ' + data);
			}
		});
	}
	//tab切换事件
	addEvent(tab, 'click', function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (target.nodeName.toLowerCase() == 'div' && !hasClass(target, 'z-cur')) {
			setCur(target, target.index);
		}
	});
	//翻页器事件
	addEvent(oCoursePage, 'click', function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (target.nodeName.toLowerCase() == 'li' && !hasClass(target, 'z-cur')) {
			pageLoad(curTab, target.index);
		}
	});
	addEvent(prePage,'click',function(){
		if(curPage >1){
			pageLoad(curTab,curPage-1);
		}
	});
	addEvent(nextPage,'click',function(){
		if(curPage < aCoursePage.length){
			pageLoad(curTab,curPage+1);
		}
	});
		//页面初始化时加载第一页
	tabBtn[0].click();
})();
//视频模块
(function() {
	var video = $('video'),
		popupVideo = $('popupVideo'),
		close = $('closeVideo'),
		playWindow = $('playWindow');
	var playIMG = video.getElementsByTagName('img')[0];
	addEvent(playIMG, 'click', function() {
		popupVideo.style.display = 'block';
	});
	addEvent(close, 'click', function() {
		popupVideo.style.display = 'none';
		playWindow.pause(); //暂停播放
	});
})();
//hotRanking模块
(function() {
	var roll = document.querySelector('.roll');
	var total,
		index = -1,
		timer = null,
		interval = 5000;
	//hotRanking列表数据装载
	ajax({
		method: 'GET',
		url: 'http://study.163.com/webDev/hotcouresByCategory.htm',
		success: function(data) {
			console.log('hotRanking list request succeed.');
			var list = JSON.parse(data);
			total = list.length;
			for (var i = 0; i < total; i++) {
				var a = document.createElement('a');
				a.innerHTML = '<div><img src="' + list[i].smallPhotoUrl + '"></div><p title="' + list[i].name + '">' + list[i].name + '</p><span>' + list[i].learnerCount + '</span>';
				roll.appendChild(a);
			}
		},
		error: function(data) {
			console.log('hotRanking list request failed, error stutas: ' + data);
		}
	});
	//列表滚动
	function startRoll(t) {
		move(roll, 'top', t);
	}

	function next() {
		index++;
		//最多显示10个
		index = index > total - 10 ? 0 : index;
		var target = -(index * 70) + 56;
		startRoll(target);
	}

	function autoPlay() {
		if (timer) {
			clearInterval(timer);
		}
		timer = setInterval(function() {
			next();
		}, interval);
	}
	addEvent(roll, 'mouseenter', function() {
		clearInterval(timer);
	});
	addEvent(roll, 'mouseleave', function() {
		autoPlay();
	});
	next();
	autoPlay();
})();