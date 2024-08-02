'use client';
import React, { useState, useEffect } from 'react';
import { getAccounts, getAccountStatements } from '../../services/api';
import { Container, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Button, Paper } from '@mui/material';

export default function AccountStatements() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [statementsData, setStatementsData] = useState({
        total_credit: 0,
        total_debit: 0,
        credit_transactions: [],
        debit_transactions: [],
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await getAccounts();
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts', error);
        }
    };

    const fetchStatements = async (accountId) => {
        try {
            const response = await getAccountStatements(accountId);
            setStatementsData(response.data);
            setSelectedAccount(accountId);
        } catch (error) {
            console.error('Error fetching statements', error);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Account Statements</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Account Title</TableCell>
                            <TableCell>Balance</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell>{account.account_title}</TableCell>
                                <TableCell>{account.balance}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => fetchStatements(account.account_number)}>
                                        View Statements
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedAccount && (
                <div>
                    <Typography variant="h5" gutterBottom>Last month statement for account {selectedAccount}</Typography>
                    <Typography variant="h6">Total Credit: $ {statementsData.total_credit}</Typography>
                    <Typography variant="h6">Total Debit: $ {statementsData.total_debit}</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statementsData.credit_transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{transaction.details}</TableCell>
                                        <TableCell>{transaction.price}</TableCell>
                                    </TableRow>
                                ))}
                                {statementsData.debit_transactions.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
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