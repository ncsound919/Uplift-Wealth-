import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PortfolioAsset, FinancialGoal, Transaction } from '../types';

// Portfolio Asset operations
export async function savePortfolioAsset(userId: string, asset: PortfolioAsset): Promise<void> {
  await setDoc(doc(db, 'portfolioAssets', asset.id), {
    ...asset,
    userId,
    date: Timestamp.fromDate(asset.date)
  });
}

export async function getPortfolioAssets(userId: string): Promise<PortfolioAsset[]> {
  const q = query(collection(db, 'portfolioAssets'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      date: data.date.toDate()
    } as PortfolioAsset;
  });
}

export function subscribeToPortfolioAssets(
  userId: string,
  callback: (assets: PortfolioAsset[]) => void
): () => void {
  const q = query(collection(db, 'portfolioAssets'), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const assets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate()
      } as PortfolioAsset;
    });
    callback(assets);
  });
}

export async function deletePortfolioAsset(assetId: string): Promise<void> {
  await deleteDoc(doc(db, 'portfolioAssets', assetId));
}

// Financial Goal operations
export async function saveFinancialGoal(userId: string, goal: FinancialGoal): Promise<void> {
  await setDoc(doc(db, 'financialGoals', goal.id), {
    ...goal,
    userId,
    deadline: Timestamp.fromDate(goal.deadline)
  });
}

export async function getFinancialGoals(userId: string): Promise<FinancialGoal[]> {
  const q = query(collection(db, 'financialGoals'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      deadline: data.deadline.toDate()
    } as FinancialGoal;
  });
}

export function subscribeToFinancialGoals(
  userId: string,
  callback: (goals: FinancialGoal[]) => void
): () => void {
  const q = query(collection(db, 'financialGoals'), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        deadline: data.deadline.toDate()
      } as FinancialGoal;
    });
    callback(goals);
  });
}

export async function deleteFinancialGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, 'financialGoals', goalId));
}

// Transaction operations
export async function saveTransaction(userId: string, transaction: Transaction): Promise<void> {
  await setDoc(doc(db, 'transactions', transaction.id), {
    ...transaction,
    userId,
    date: Timestamp.fromDate(transaction.date)
  });
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      date: data.date.toDate()
    } as Transaction;
  });
}

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate()
      } as Transaction;
    });
    callback(transactions);
  });
}
