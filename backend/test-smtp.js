"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer = require("nodemailer");
var dotenv = require("dotenv");
dotenv.config();
function testSmtp() {
    return __awaiter(this, void 0, void 0, function () {
        var config, transporter, err_1, testRecipient, info, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        host: process.env.SMTP_HOST,
                        port: Number(process.env.SMTP_PORT),
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                        from: 'info@arafatvisitor.cloud', // Test sender
                    };
                    console.log('SMTP Configuration:');
                    console.log('  Host:', config.host);
                    console.log('  Port:', config.port);
                    console.log('  User:', config.user);
                    console.log('  From:', config.from);
                    console.log('');
                    if (!config.host || !config.port || !config.user || !config.pass) {
                        console.error('Missing SMTP configuration in .env');
                        process.exit(1);
                    }
                    transporter = nodemailer.createTransport({
                        host: config.host,
                        port: config.port,
                        secure: config.port === 465,
                        auth: {
                            user: config.user,
                            pass: config.pass,
                        },
                    });
                    console.log('Testing SMTP connection...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.verify()];
                case 2:
                    _a.sent();
                    console.log('SMTP connection verified successfully!');
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('SMTP connection failed:', err_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4:
                    testRecipient = process.argv[2] || 'adel.noaman@arafatgroup.com';
                    console.log("\nSending test email to: ".concat(testRecipient));
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, transporter.sendMail({
                            from: config.from,
                            to: testRecipient,
                            subject: 'SMTP Test - Arafat Visitor System',
                            html: "\n        <h2>SMTP Test Successful</h2>\n        <p>This is a test email from the Arafat Visitor Management System.</p>\n        <p><strong>Sender:</strong> ".concat(config.from, "</p>\n        <p><strong>Timestamp:</strong> ").concat(new Date().toISOString(), "</p>\n      "),
                            text: "SMTP Test Successful\n\nThis is a test email from the Arafat Visitor Management System.\nSender: ".concat(config.from, "\nTimestamp: ").concat(new Date().toISOString()),
                        })];
                case 6:
                    info = _a.sent();
                    console.log('Email sent successfully!');
                    console.log('Message ID:', info.messageId);
                    console.log('Response:', info.response);
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.error('Failed to send email:', err_2);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
testSmtp();
