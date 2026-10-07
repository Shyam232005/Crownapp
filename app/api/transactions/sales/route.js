// 1. Create the Transaction Record
      const txArray = await Transaction.create([{
        companyId: decoded.companyId,
        createdBy: decoded.userId,
        type: 'SALES',
        // Fix: Route to Owner if Employee, route directly to CA if Owner
        status: decoded.role === 'Employee' ? 'PENDING_OWNER_APPROVAL' : 'PENDING_CA_REVIEW',
        totalAmount,
        taxAmount: totalTax, 
        metadata: { invoiceNumber, vendorName: customerName, hsnCode } 
      }], { session: dbSession });