const ExcelJS = require("exceljs");
const { Expense, Income, TimeLog, User } = require("../models");
const { sendEmail } = require("../utils/emailService");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");

// Helper function to calculate date range based on period
const calculateDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 1);
      break;
    case 'week':
    case 'thisWeek':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      endDate = today;
      break;
    default:
      // Default to last 30 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      endDate = today;
  }
  
  return { startDate, endDate };
};

const exportData = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      raw: true,
    });
    const timeLogs = await TimeLog.findAll({
      where: { userId: req.user.id },
      raw: true,
    });

    const workbook = new ExcelJS.Workbook();
    const expenseSheet = workbook.addWorksheet("Шығындар");
    const timeSheet = workbook.addWorksheet("Уақыт есебі");

    expenseSheet.addRow(["ID", "Категория", "Сумма", "Дата", "Ескертпе"]);
    expenses.forEach((exp) =>
      expenseSheet.addRow([
        exp.id,
        exp.category,
        exp.amount,
        exp.date,
        exp.note,
      ])
    );

    timeSheet.addRow(["ID", "Task ID", "Time Spent", "Date"]);
    timeLogs.forEach((log) =>
      timeSheet.addRow([log.id, log.taskId, log.time_spent, log.date])
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Generate PDF report
const generatePDFReport = async (req, res) => {
  try {
    const { period } = req.query;
    const { startDate, endDate } = period ? calculateDateRange(period) : { 
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
      endDate: new Date() 
    };

    // Get user data
    const user = await User.findByPk(req.user.id);
    
    // Fetch expenses and incomes within the date range
    const where = {
      userId: req.user.id,
      date: { [Op.between]: [startDate, endDate] }
    };
    
    const expenses = await Expense.findAll({ where, raw: true });
    const incomes = await Income.findAll({ where, raw: true });
    
    // Calculate totals
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    const balance = totalIncome - totalExpense;
    
    // Create PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    doc.pipe(res);
    
    // Add header
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated for: ${user.name} (${user.email})`);
    doc.text(`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    doc.moveDown();
    
    // Summary section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Income: ${totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ${totalExpense.toFixed(2)}`);
    doc.text(`Balance: ${balance.toFixed(2)}`);
    doc.moveDown();
    
    // Expenses section
    if (expenses.length > 0) {
      doc.fontSize(16).text('Expenses', { underline: true });
      
      // Group expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += parseFloat(expense.amount);
      });
      
      // List expense categories
      Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          doc.text(`${category}: ${amount.toFixed(2)} (${((amount / totalExpense) * 100).toFixed(1)}%)`);
        });
      
      doc.moveDown();
      
      // List recent expenses
      doc.text('Recent Expenses:');
      expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .forEach(expense => {
          doc.text(`${new Date(expense.date).toLocaleDateString()} - ${expense.category} - ${expense.amount.toFixed(2)} - ${expense.note || 'No description'}`);
        });
    }
    
    doc.moveDown();
    
    // Incomes section
    if (incomes.length > 0) {
      doc.fontSize(16).text('Incomes', { underline: true });
      
      // Group incomes by category
      const incomesByCategory = {};
      incomes.forEach(income => {
        if (!incomesByCategory[income.category]) {
          incomesByCategory[income.category] = 0;
        }
        incomesByCategory[income.category] += parseFloat(income.amount);
      });
      
      // List income categories
      Object.entries(incomesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          doc.text(`${category}: ${amount.toFixed(2)} (${((amount / totalIncome) * 100).toFixed(1)}%)`);
        });
      
      doc.moveDown();
      
      // List recent incomes
      doc.text('Recent Incomes:');
      incomes
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .forEach(income => {
          doc.text(`${new Date(income.date).toLocaleDateString()} - ${income.category} - ${income.amount.toFixed(2)} - ${income.note || 'No description'}`);
        });
    }
    
    // Footer
    doc.moveDown();
    doc.fontSize(10).text(`Report generated on ${new Date().toLocaleString()}`, { align: 'center' });
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

// Send email report
const sendReportEmail = async (req, res) => {
  try {
    const { period, includeExpenses, includeIncomes } = req.body;
    const { startDate, endDate } = period ? calculateDateRange(period) : { 
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
      endDate: new Date() 
    };
    
    // Get user data
    const user = await User.findByPk(req.user.id);
    
    // Prepare query
    const where = {
      userId: req.user.id,
      date: { [Op.between]: [startDate, endDate] }
    };
    
    let expenses = [], incomes = [];
    let totalExpense = 0, totalIncome = 0;
    
    // Fetch data based on filters
    if (includeExpenses !== false) {
      expenses = await Expense.findAll({ where, raw: true });
      totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }
    
    if (includeIncomes !== false) {
      incomes = await Income.findAll({ where, raw: true });
      totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    }
    
    // Calculate balance
    const balance = totalIncome - totalExpense;
    
    // Generate email body
    let emailBody = `
      Hello ${user.name},
      
      Here is your financial report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}:
      
      Summary:
      ${includeIncomes !== false ? `Total Income: ${totalIncome.toFixed(2)}` : ''}
      ${includeExpenses !== false ? `Total Expenses: ${totalExpense.toFixed(2)}` : ''}
      Balance: ${balance.toFixed(2)}
      
    `;
    
    // Add expense details if included
    if (includeExpenses !== false && expenses.length > 0) {
      emailBody += `
        Expense Categories:
      `;
      
      // Group expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += parseFloat(expense.amount);
      });
      
      // List expense categories
      Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          emailBody += `  ${category}: ${amount.toFixed(2)} (${((amount / totalExpense) * 100).toFixed(1)}%)\n`;
        });
    }
    
    // Add income details if included
    if (includeIncomes !== false && incomes.length > 0) {
      emailBody += `
        Income Categories:
      `;
      
      // Group incomes by category
      const incomesByCategory = {};
      incomes.forEach(income => {
        if (!incomesByCategory[income.category]) {
          incomesByCategory[income.category] = 0;
        }
        incomesByCategory[income.category] += parseFloat(income.amount);
      });
      
      // List income categories
      Object.entries(incomesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          emailBody += `  ${category}: ${amount.toFixed(2)} (${((amount / totalIncome) * 100).toFixed(1)}%)\n`;
        });
    }
    
    // Add footer
    emailBody += `
      This report was automatically generated on ${new Date().toLocaleString()}
      
      Thank you for using our service!
    `;
    
    // Send email
    await sendEmail(
      user.email,
      `Financial Report: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      emailBody
    );
    
    res.status(200).json({ message: "Report sent successfully to your email" });
  } catch (error) {
    res.status(500).json({ message: "Қате шықты", error: error.message });
  }
};

module.exports = { exportData, generatePDFReport, sendReportEmail };
