const bcrypt = require('bcryptjs');
const db = require('../config/db');

// 处理登录
exports.login = (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    // 查询数据库，验证用户的用户名和密码
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询失败' });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: '用户名不存在' });
        }

        // 比较密码
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: '密码比对失败' });
            }
            if (!isMatch) {
                console.log(user.password, password);
                return res.status(400).json({ error: '密码错误' });
            }

            // 登录成功
            res.status(200).json({ message: '登录成功' });
        });
    });
};

// 注册接口
exports.register = (req, res) => {
    const { username, password } = req.body;

    // 后端验证用户名和密码
    if (!/^[a-zA-Z0-9_]{5,12}$/.test(username)) {
        return res.status(400).json({ error: '账号必须由英文、数字或下划线构成，且长度为5~12位' });
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,16}$/.test(password) && !/^(?=.*[a-zA-Z])(?=.*[!]).{8,16}$/.test(password)) {
        return res.status(400).json({ error: '密码必须包含英文、数字或感叹号中的两种，且长度为8~16位' });
    }

    // 检查用户名是否已存在
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询失败' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 加密密码并存入数据库
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: '密码加密失败' });
            }

            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertQuery, [username, hashedPassword], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: '数据库插入失败' });
                }

                res.status(201).json({ message: '注册成功' });
            });
        });
    });
};
