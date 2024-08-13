'use client';
import React, { useState, useEffect } from 'react';
import { Container, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Paper } from '@mui/material';
import axios from 'axios';
import { getDailyTransactions, getMonthlyReport, getAnnualReport } from '../../services/api';

export default function Reports() {
    const [dailyTransactions, setDailyTransactions] = useState({ transactions: [], payments: [] });
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [annualReport, setAnnualReport] = useState(null);

    useEffect(() => {
        getDailyTransactions().then(response => setDailyTransactions(response.data));
    }, []);

    const handleGenerateMonthlyReport = async () => {
        const response = await getMonthlyReport();
        setMonthlyReport(response.data);
    };

    const handleGenerateAnnualReport = async () => {
        const response = await getAnnualReport();
        setAnnualReport(response.data);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Daily Transactions</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Account</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dailyTransactions.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.account_title}</TableCell>
                                <TableCell>{transaction.details}</TableCell>
                                <TableCell>{transaction.total_amount}</TableCell>
                            </TableRow>
                        ))}
                        {dailyTransactions.payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                <TableCell>{payment.account_title}</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>{payment.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button variant="contained" color="primary" onClick={handleGenerateMonthlyReport} sx={{ my: 3, mr:3 }}>
                Generate Monthly Report
            </Button>

            {monthlyReport && (
                <div>
                    <Typography variant="h5" gutterBottom>Monthly Report</Typography>
                    <Typography variant="h6">Total Credit: {monthlyReport.total_credits}</Typography>
                    <Typography variant="h6">Total Debit: {monthlyReport.total_debits}</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Account</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {monthlyReport.transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{transaction.account_title}</TableCell>
                                        <TableCell>{transaction.details}</TableCell>
                                        <TableCell>{transaction.total_amount}</TableCell>
                                    </TableRow>
                                ))}
                                {monthlyReport.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{payment.account_title}</TableCell>
                                        <TableCell>Payment</TableCell>
                                        <TableCell>{payment.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

            <Button variant="contained" color="primary" onClick={handleGenerateAnnualReport} sx={{ my: 3 }}>
                Generate Annual Report
            </Button>

            {annualReport && (
                <div>
                    <Typography variant="h5" gutterBottom>Annual Report</Typography>
                    <Typography variant="h6">Total Credit: {annualReport.total_credits}</Typography>
                    <Typography variant="h6">Total Debit: {annualReport.total_debits}</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Account</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {annualReport.transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{transaction.account_title}</TableCell>
                                        <TableCell>{transaction.details}</TableCell>
                                        <TableCell>{transaction.total_amount}</TableCell>
                                    </TableRow>
                                ))}
                                {annualReport.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{payment.account_title}</TableCell>
                                        <TableCell>Payment</TableCell>
                                        <TableCell>{payment.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </Container>
    );
}