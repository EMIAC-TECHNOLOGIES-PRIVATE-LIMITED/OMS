
import ExcelJS from 'exceljs';
import { writeFile } from 'fs/promises';

// Enum Definitions
const OrderPaymentStatus = [
    'RECEIVED',
    'PARTIALLY_RECEIVED',
    'PENDING',
    'NOT_RECEIVED',
] as const;

const VendorPaymentStatus = [
    'HOLD',
    'UNPAID',
    'PAID',
    'PARTIALLY_PAID',
    'CANCEL',
] as const;

const OrderStatus = [
    'PENDING',
    'GIVEN',
    'PUBLISH',
    'NOT_PUBLISH',
    'CANCEL',
    'REPLACEMENT',
    'NEED_UPDATE',
] as const;

const VendorInvoiceStatus = [
    'PENDING',
    'ASK',
    'RECEIVED',
    'GIVEN',
    'PAID',
] as const;

const SiteType = ['NORMAL', 'CASINO', 'ADULT', 'CBD'] as const;

const Follow = ['Do_follow', 'No_follow', 'Sponsored'] as const;

const PriceType = ['Paid', 'Free', 'Exchange'] as const;

const Posting = ['Yes', 'No'] as const;

const WebsiteType = ['Default', 'PR', 'Language'] as const;

const WebsiteStatus = ['Normal', 'Blacklist', 'Disqualified'] as const;



// Interfaces for Configuration
interface ColumnConfig {
    header: string;
    key: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    isEnum?: boolean;
    enumValues?: readonly string[];
    isOptional?: boolean;
}

interface ModelConfig {
    modelName: string;
    columns: ColumnConfig[];
}

// Configuration for Each Model
const modelConfigs: Record<string, ModelConfig> = {
    Vendor: {
        modelName: 'Vendor',
        columns: [
            { header: 'Name', key: 'name', type: 'string' },
            { header: 'Phone', key: 'phone', type: 'string', isOptional: true },
            { header: 'Email', key: 'email', type: 'string', isOptional: true },
            { header: 'Contacted From', key: 'contactedFrom', type: 'string', isOptional: true },
            { header: 'Bank Name', key: 'bankName', type: 'string', isOptional: true },
            { header: 'Account Number', key: 'accountNumber', type: 'string', isOptional: true },
            { header: 'IFSC Code', key: 'ifscCode', type: 'string', isOptional: true },
            { header: 'PayPal ID', key: 'paypalId', type: 'string', isOptional: true },
            { header: 'Skype ID', key: 'skypeId', type: 'string', isOptional: true },
            { header: 'UPI ID', key: 'upiId', type: 'string', isOptional: true },
        ],
    },
    Site: {
        modelName: 'Site',
        columns: [
            { header: 'Website', key: 'website', type: 'string' },
            { header: 'Niche', key: 'niche', type: 'string', isOptional: true },
            { header: 'Site Category', key: 'site_category', type: 'string', isOptional: true },
            { header: 'DA', key: 'da', type: 'number' },
            { header: 'PA', key: 'pa', type: 'number' },
            { header: 'Vendor ID', key: 'vendor_id', type: 'number', isOptional: true },
            { header: 'Price', key: 'price', type: 'number' },
            { header: 'Sailing Price', key: 'sailing_price', type: 'number', isOptional: true },
            { header: 'Discount', key: 'discount', type: 'number', isOptional: true },
            { header: 'Adult', key: 'adult', type: 'number' },
            { header: 'Casino Adult', key: 'casino_adult', type: 'number' },
            { header: 'Contact', key: 'contact', type: 'string', isOptional: true },
            { header: 'Contact From', key: 'contact_from', type: 'string', isOptional: true },
            { header: 'Web Category', key: 'web_category', type: 'string', isOptional: true },
            {
                header: 'Follow',
                key: 'follow',
                type: 'string',
                isEnum: true,
                enumValues: Follow,
            },
            {
                header: 'Price Category',
                key: 'price_category',
                type: 'string',
                isEnum: true,
                enumValues: PriceType,
            },
            { header: 'Traffic', key: 'traffic', type: 'number' },
            { header: 'Spam Score', key: 'spam_score', type: 'number', isOptional: true },
            { header: 'CBD Price', key: 'cbd_price', type: 'number', isOptional: true },
            { header: 'Remark', key: 'remark', type: 'string', isOptional: true },
            { header: 'Contact From ID', key: 'contact_from_id', type: 'string', isOptional: true },
            { header: 'Vendor Country', key: 'vendor_country', type: 'string', isOptional: true },
            { header: 'Phone Number', key: 'phone_number', type: 'string', isOptional: true },
            { header: 'Sample URL', key: 'sample_url', type: 'string', isOptional: true },
            { header: 'Bank Details', key: 'bank_details', type: 'string', isOptional: true },
            { header: 'DR', key: 'dr', type: 'number', isOptional: true },
            { header: 'Web IP', key: 'web_ip', type: 'string', isOptional: true },
            { header: 'Web Country', key: 'web_country', type: 'string', isOptional: true },
            { header: 'Link Insertion Cost', key: 'link_insertion_cost', type: 'string', isOptional: true },
            { header: 'TAT', key: 'tat', type: 'string', isOptional: true },
            {
                header: 'Social Media Posting',
                key: 'social_media_posting',
                type: 'string',
                isEnum: true,
                enumValues: Posting,
            },
            { header: 'SEMrush Traffic', key: 'semrush_traffic', type: 'number', isOptional: true },
            { header: 'SEMrush First Country Name', key: 'semrush_first_country_name', type: 'string', isOptional: true },
            { header: 'SEMrush Second Country Name', key: 'semrush_second_country_name', type: 'string', isOptional: true },
            { header: 'SEMrush First Country Traffic', key: 'semrush_first_country_traffic', type: 'number', isOptional: true },
            { header: 'SEMrush Second Country Traffic', key: 'semrush_second_country_traffic', type: 'number', isOptional: true },
            { header: 'SEMrush Third Country Name', key: 'semrush_third_country_name', type: 'string', isOptional: true },
            { header: 'SEMrush Third Country Traffic', key: 'semrush_third_country_traffic', type: 'number', isOptional: true },
            { header: 'SEMrush Fourth Country Name', key: 'semrush_fourth_country_name', type: 'string', isOptional: true },
            { header: 'SEMrush Fourth Country Traffic', key: 'semrush_fourth_country_traffic', type: 'number', isOptional: true },
            { header: 'SEMrush Fifth Country Name', key: 'semrush_fifth_country_name', type: 'string', isOptional: true },
            { header: 'SEMrush Fifth Country Traffic', key: 'semrush_fifth_country_traffic', type: 'number', isOptional: true },
            { header: 'SimilarWeb Traffic', key: 'similarweb_traffic', type: 'number', isOptional: true },
            {
                header: 'Vendor Invoice Status',
                key: 'vendor_invoice_status',
                type: 'string',
                isEnum: true,
                enumValues: VendorInvoiceStatus,
            },
            { header: 'Main Category', key: 'main_category', type: 'string', isOptional: true },
            { header: 'Site Update Date', key: 'site_update_date', type: 'date', isOptional: true },
            {
                header: 'Website Type',
                key: 'website_type',
                type: 'string',
                isEnum: true,
                enumValues: WebsiteType,
            },
            { header: 'Language', key: 'language', type: 'string', isOptional: true },
            { header: 'GST', key: 'gst', type: 'string', isOptional: true },
            { header: 'Disclaimer', key: 'disclaimer', type: 'string', isOptional: true },
            { header: 'Anchor Text', key: 'anchor_text', type: 'string', isOptional: true },
            { header: 'Banner Image Price', key: 'banner_image_price', type: 'number', isOptional: true },
            { header: 'CP Update Date', key: 'cp_update_date', type: 'date', isOptional: true },
            { header: 'Pure Category', key: 'pure_category', type: 'string', isOptional: true },
            { header: 'Availability', key: 'availability', type: 'string', isOptional: true },
            { header: 'Indexed URL', key: 'indexed_url', type: 'string', isOptional: true },
            {
                header: 'Website Status',
                key: 'website_status',
                type: 'string',
                isEnum: true,
                enumValues: WebsiteStatus,
            },
            { header: 'Website Quality', key: 'website_quality', type: 'string', isOptional: true },
            { header: 'Number of Links', key: 'num_of_links', type: 'number', isOptional: true },
            { header: 'SEMrush Updation Date', key: 'semrush_updation_date', type: 'date', isOptional: true },
            { header: 'Organic Traffic', key: 'organic_traffic', type: 'number' },
            { header: 'Organic Traffic Last Update Date', key: 'organic_traffic_last_update_date', type: 'date' },
            { header: 'Created At', key: 'created_at', type: 'date' },
        ],
    },
    Order: {
        modelName: 'Order',
        columns: [
            { header: 'Client ID', key: 'client_id', type: 'number', isOptional: true },
            { header: 'Order Date', key: 'orderDate', type: 'date', isOptional: true },
            { header: 'Publish Status', key: 'publishStatus', type: 'boolean', isOptional: true },
            { header: 'Publish Date', key: 'publishDate', type: 'date', isOptional: true },
            { header: 'Publish Link', key: 'publishLink', type: 'string', isOptional: true },
            { header: 'Transaction Amount', key: 'transactionAmount', type: 'number', isOptional: true },
            { header: 'Received Amount', key: 'receivedAmount', type: 'number', isOptional: true },
            { header: 'Account Type', key: 'accountType', type: 'string', isOptional: true },
            { header: 'Account ID', key: 'accountId', type: 'number', isOptional: true },
            { header: 'Proposed Amount', key: 'proposedAmount', type: 'number', isOptional: true },
            { header: 'Content Amount', key: 'contentAmount', type: 'number', isOptional: true },
            { header: 'Website', key: 'website', type: 'string', isOptional: true },
            { header: 'Website Remark', key: 'websiteRemark', type: 'string', isOptional: true },
            { header: 'Vendor Email', key: 'vendorEmail', type: 'string', isOptional: true },
            { header: 'Vendor Name', key: 'vendorName', type: 'string', isOptional: true },
            { header: 'Site Cost', key: 'siteCost', type: 'number', isOptional: true },
            { header: 'Vendor Contacted From', key: 'vendorContactedFrom', type: 'string', isOptional: true },
            { header: 'Remark', key: 'remark', type: 'string', isOptional: true },
            { header: 'Vendor Website Remark', key: 'vendorWebsiteRemark', type: 'string', isOptional: true },
            { header: 'Client Amount Received', key: 'clientAmountReceived', type: 'number', isOptional: true },
            { header: 'Client Amount Received Date', key: 'clientAmountReceivedDate', type: 'string', isOptional: true },
            {
                header: 'Client Amount Received Status',
                key: 'clientAmountReceivedStatus',
                type: 'string',
                isEnum: true,
                enumValues: OrderPaymentStatus,
                isOptional: true,
            },
            { header: 'Vendor Payment Amount', key: 'vendorPaymentAmount', type: 'number', isOptional: true },
            { header: 'Vendor Account Type', key: 'vendorAccountType', type: 'string', isOptional: true },
            {
                header: 'Vendor Payment Status',
                key: 'vendorPaymentStatus',
                type: 'string',
                isEnum: true,
                enumValues: VendorPaymentStatus,
                isOptional: true,
            },
            { header: 'Vendor Payment Date', key: 'vendorPaymentDate', type: 'string', isOptional: true },
            { header: 'Vendor Transaction ID', key: 'vendorTransactionId', type: 'string', isOptional: true },
            { header: 'Ordered By', key: 'orderedBy', type: 'number', isOptional: true },
            { header: 'Ordered Updated By', key: 'orderedUpdatedBy', type: 'number', isOptional: true },
            { header: 'Order Operated By', key: 'orderOperatedBy', type: 'number', isOptional: true },
            { header: 'Order Operated Update By', key: 'orderOperatedUpdateBy', type: 'number', isOptional: true },
            { header: 'PayPal ID', key: 'paypalId', type: 'string', isOptional: true },
            {
                header: 'Status',
                key: 'status',
                type: 'string',
                isEnum: true,
                enumValues: OrderStatus,
                isOptional: true,
            },
            { header: 'Content Doc', key: 'contentDoc', type: 'string', isOptional: true },
            {
                header: 'Vendor Invoice Status',
                key: 'vendorInvoiceStatus',
                type: 'string',
                isEnum: true,
                enumValues: VendorInvoiceStatus,
                isOptional: true,
            },
            { header: 'Payment Remark', key: 'paymentRemark', type: 'string', isOptional: true },
            { header: 'Actual Received Amount', key: 'actualReceivedAmount', type: 'number', isOptional: true },
            { header: 'Actual Paid Amount', key: 'actualPaidAmount', type: 'number', isOptional: true },
            {
                header: 'Site Type',
                key: 'siteType',
                type: 'string',
                isEnum: true,
                enumValues: SiteType,
                isOptional: true,
            },
            { header: 'Website Type', key: 'websiteType', type: 'string', isOptional: true },
            { header: 'Invoice No', key: 'invoiceNo', type: 'string', isOptional: true },
            { header: 'Invoice Status', key: 'invoiceStatus', type: 'string', isOptional: true },
            { header: 'Price With GST', key: 'priceWithGST', type: 'number', isOptional: true },
            { header: 'Indexed URL', key: 'indexedUrl', type: 'string', isOptional: true },
            { header: 'Status Update Datetime', key: 'statusUpdateDatetime', type: 'date', isOptional: true },
        ],
    },
    Client: {
        modelName: 'Client',
        columns: [
            { header: 'Name', key: 'name', type: 'string' },
            { header: 'Link Sell', key: 'linkSell', type: 'number', isOptional: true },
            { header: 'Content Sell', key: 'contentSell', type: 'number', isOptional: true },
            { header: 'Total Amount Received', key: 'totalAmountReceived', type: 'number', isOptional: true },
            { header: 'Total Orders', key: 'totalOrders', type: 'number', isOptional: true },
            { header: 'Phone', key: 'phone', type: 'string', isOptional: true },
            { header: 'Email', key: 'email', type: 'string', isOptional: true },
            { header: 'FB ID', key: 'fbId', type: 'string', isOptional: true },
            { header: 'Contacted ID', key: 'contactedId', type: 'string', isOptional: true },
            { header: 'Site Name', key: 'siteName', type: 'string', isOptional: true },
            { header: 'Source', key: 'source', type: 'string', isOptional: true },
            { header: 'Client Client Name', key: 'clientClientName', type: 'string', isOptional: true },
            { header: 'Client Projects', key: 'clientProjects', type: 'string', isOptional: true },
            { header: 'Client Created At', key: 'clientCreatedAt', type: 'date', isOptional: true },
            { header: 'Client Updated At', key: 'clientUpdatedAt', type: 'date', isOptional: true },
        ],
    },
};

// Helper Function to Add Data Validation for Enums
const addEnumValidation = (
    worksheet: ExcelJS.Worksheet,
    column: ColumnConfig,
    colNumber: number
) => {
    if (column.isEnum && column.enumValues) {
        const enumList = column.enumValues.join(',');
        worksheet.getColumn(colNumber).eachCell((cell, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            cell.dataValidation = {
                type: 'list',
                allowBlank: column.isOptional || false,
                formulae: [`"${enumList}"`],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: 'Invalid Entry',
                error: `Please select a value from the dropdown list.`,
            };
        });
    }
};

// Function to Generate Excel Workbook for a Given Model
export const generateExcel = async (modelName: keyof typeof modelConfigs): Promise<Buffer> => {
    const config = modelConfigs[modelName];
    if (!config) {
        throw new Error(`Model configuration for "${modelName}" not found.`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${config.modelName} Bulk Import`);

    // Define Columns
    const excelColumns = config.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: 20,
    }));
    worksheet.columns = excelColumns;

    // Apply Data Validation for Enum Columns
    config.columns.forEach((column, index) => {
        if (column.isEnum && column.enumValues) {
            addEnumValidation(worksheet, column, index + 1);
        }
    });

    // Optionally, you can add some instructions or headers
    worksheet.getRow(1).font = { bold: true };

    // Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};

// Function to Save Excel File Locally (For Node.js Environment)
export const saveExcelFile = async (buffer: Buffer, filename: string) => {
    await writeFile(filename, buffer);
    console.log(`Excel file "${filename}" has been saved successfully.`);
};

// Example Usage (Uncomment the following lines to test in a Node.js environment)
/*
(async () => {
    try {
        const vendorExcel = await generateExcel('Vendor');
        await saveExcelFile(vendorExcel, 'Vendor_Bulk_Import.xlsx');

        const siteExcel = await generateExcel('Site');
        await saveExcelFile(siteExcel, 'Site_Bulk_Import.xlsx');

        const orderExcel = await generateExcel('Order');
        await saveExcelFile(orderExcel, 'Order_Bulk_Import.xlsx');

        const clientExcel = await generateExcel('Client');
        await saveExcelFile(clientExcel, 'Client_Bulk_Import.xlsx');
    } catch (error) {
        console.error('Error generating Excel files:', error);
    }
})();
*/

