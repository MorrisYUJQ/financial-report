import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Table, Statistic } from 'antd';
import { Line, Column } from '@ant-design/charts';
import * as XLSX from 'xlsx';
import styled from '@emotion/styled';

const { Header, Content } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: #f0f2f5;
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const App: React.FC = () => {
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    // 读取Excel文件
    const loadExcelData = async () => {
      try {
        const response = await fetch('/卡卡预算表25.2.27.xls');
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFinancialData(jsonData);
      } catch (error) {
        console.error('加载Excel文件失败:', error);
      }
    };

    loadExcelData();
  }, []);

  return (
    <StyledLayout>
      <StyledHeader>
        <Title level={3}>2025年1月财务报表</Title>
      </StyledHeader>
      <StyledContent>
        <Row gutter={[24, 24]}>
          <Col span={6}>
            <StyledCard>
              <Statistic title="总收入" value={financialData?.totalIncome || 0} prefix="¥" />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic title="总支出" value={financialData?.totalExpense || 0} prefix="¥" />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic title="净利润" value={financialData?.netProfit || 0} prefix="¥" />
            </StyledCard>
          </Col>
          <Col span={6}>
            <StyledCard>
              <Statistic title="利润率" value={financialData?.profitMargin || 0} suffix="%" />
            </StyledCard>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <StyledCard title="收入支出趋势">
              <Line
                data={financialData?.trends || []}
                xField="date"
                yField="value"
                seriesField="type"
                smooth
                animation={{
                  appear: {
                    animation: 'wave-in',
                    duration: 1000,
                  },
                }}
              />
            </StyledCard>
          </Col>
          <Col span={12}>
            <StyledCard title="各部门支出占比">
              <Column
                data={financialData?.departmentExpenses || []}
                xField="department"
                yField="expense"
                label={{
                  position: 'middle',
                  style: {
                    fill: '#FFFFFF',
                    opacity: 0.6,
                  },
                }}
              />
            </StyledCard>
          </Col>
        </Row>

        <StyledCard title="详细数据">
          <Table
            dataSource={financialData?.details || []}
            columns={[
              { title: '日期', dataIndex: 'date', key: 'date' },
              { title: '类别', dataIndex: 'category', key: 'category' },
              { title: '金额', dataIndex: 'amount', key: 'amount' },
              { title: '说明', dataIndex: 'description', key: 'description' },
            ]}
            pagination={{ pageSize: 10 }}
          />
        </StyledCard>
      </StyledContent>
    </StyledLayout>
  );
};

export default App; 