<template>
  <el-container class="layout-container">
    <el-header>
      <h2>25年1月卡卡财务报表</h2>
    </el-header>
    
    <el-main>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="box-card">
            <template #header>车辆收入</template>
            <div class="statistic">
              <span class="prefix">¥</span>
              <span class="value">{{ formatNumber(financialData?.vehicleIncome) }}</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="box-card">
            <template #header>总支出</template>
            <div class="statistic">
              <span class="prefix">¥</span>
              <span class="value">{{ formatNumber(financialData?.totalExpense) }}</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="box-card">
            <template #header>收支差额</template>
            <div class="statistic" :class="{ 'negative': financialData?.balance < 0 }">
              <span class="prefix">¥</span>
              <span class="value">{{ formatNumber(financialData?.balance) }}</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="box-card">
            <template #header>车辆利润率</template>
            <div class="statistic">
              <span class="value">{{ financialData?.profitMargin }}</span>
              <span class="suffix">%</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>主要支出项目分布</template>
            <div ref="expenseChart" class="chart"></div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>收支概览</template>
            <div ref="overviewChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="box-card">
        <template #header>支出明细</template>
        <el-table :data="financialData?.expenseDetails || []" style="width: 100%">
          <el-table-column prop="category" label="类别" />
          <el-table-column prop="amount" label="金额">
            <template #default="scope">
              ¥{{ formatNumber(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const financialData = ref(null)
const expenseChart = ref(null)
const overviewChart = ref(null)

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const processData = (rawData) => {
  // 提取关键数据
  const vehicleIncome = 208039.43 // 车辆收入
  const totalExpense = 227434.72  // 总费用
  const balance = -19395.29      // 收支
  const profitMargin = 1.74      // 车辆毛利率

  // 构建支出明细
  const expenseDetails = [
    { 
      category: '实付工资', 
      amount: 113844.22, 
      description: '郁总 22,721.63元，郑 27,914.93元，徐 10,899.87元，陈 3,649.74元，飞 6,000元，史 4,800元，阮 -1,311.26元，王益波提成 39,092.54元（未付）【邮政扣1月公积金2,250元，扣社保10,307.28元（单位4,812×25.2%=1,212.62元，个人4,812×10.5%=505.26元）；泰隆银行扣徐思凡社保1,727.51元（单位部分25.4%）+1月公积金250元；收回郁凌社保1,717.88元和公积金250元；1月份社保单位部分增收1%=48.12元】'
    },
    { 
      category: '房租', 
      amount: 34959.65, 
      description: '25年1月房租 28,524.65元；承担装潢部1-2月房租 6,435元'
    },
    {
      category: '物业管理', 
      amount: 25048.4, 
      description: '25.1物业费 5,520.9元；25年梅山展厅物业费 19,527.5元'
    },
    { 
      category: '税金', 
      amount: -3900, 
      description: '威尔法正卜高开4,000元扣13%税点520元，余姚进项92.9万冲红2.3万补扣13%税点2,990元，埃尔法常成高开2,000元扣260元，装潢高开1,000元扣130元'
    },
    { 
      category: '水电', 
      amount: 700.69, 
      description: '1月水电费：13.46 + 624.75 + 62.48 = 700.69元'
    },
    { 
      category: '财务费用', 
      amount: 2278.12, 
      description: '邮政扣印花税 307.45元，泰隆银行扣印花税 1,810.67元，邮政扣手续费 80 + 80 = 160元'
    },
    { 
      category: '招待费', 
      amount: 7180, 
      description: '招待费：4,180元 + 3,000元 = 7,180元'
    },
    { 
      category: '宣传费', 
      amount: 500, 
      description: '马丁试驾视频：500元'
    },
    { 
      category: '管理费用', 
      amount: 25155.56, 
      description: '1月停车费：700元，裱字：2,980元，资料邮费：12 + 26 = 38元，牛奶：129.6元，样车马工合同回寄：12元，汉堡：32元，药：19.46元，牛奶：100.5元，马丁试驾广告牌：36元，中饭：390元，水果：789元，统计会议买票路费：27 × 2 × 0.5 = 27元，饭卡充值：1,000元，烟：1,520元，大米：350元，年会餐费：6,888元，衢州菜：260元，茶叶三盒：590 × 3 = 1,770元，中午买菜：314元，苹果：1,800元，年费：6,000元'
    },
    { 
      category: '融资利息', 
      amount: 8901.17, 
      description: '25年1月利息：23,978.17元，1月车辆利息：15,077元'
    },
    { 
      category: '通讯费', 
      amount: 200, 
      description: '电话费：200元'
    }
  ]

  // 添加车辆销售信息
  const vehicleSales = {
    totalVehicles: 10,
    details: '郁总4台（1台无装潢），郑3台，波2台，徐1台，样车销售1台（无装潢）',
    insurance: '郁总保险续保3台',
    decoration: '郁总单独装潢2台',
    revenue: 11968857,
    profitPerVehicle: 1196885.70,
    profitMargin: '1.74%'
  }

  return {
    vehicleIncome,
    totalExpense,
    balance,
    profitMargin,
    expenseDetails,
    vehicleSales
  }
}

const initCharts = (data) => {
  if (expenseChart.value) {
    const chart = echarts.init(expenseChart.value)
    const expenseData = data.expenseDetails
      .filter(item => item.amount > 0)
      .map(item => ({
        name: item.category,
        value: item.amount
      }))

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: expenseData
      }]
    })
  }

  if (overviewChart.value) {
    const chart = echarts.init(overviewChart.value)
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      yAxis: {
        type: 'category',
        data: ['收入', '支出', '结余']
      },
      series: [{
        name: '金额',
        type: 'bar',
        data: [
          { value: data.vehicleIncome, itemStyle: { color: '#67C23A' } },
          { value: data.totalExpense, itemStyle: { color: '#F56C6C' } },
          { value: data.balance, itemStyle: { color: data.balance >= 0 ? '#67C23A' : '#F56C6C' } }
        ],
        label: {
          show: true,
          formatter: '¥{c}'
        }
      }]
    })
  }
}

onMounted(() => {
  // 直接处理数据（因为数据是固定的）
  financialData.value = processData({})
  initCharts(financialData.value)

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    if (expenseChart.value) {
      echarts.getInstanceByDom(expenseChart.value)?.resize()
    }
    if (overviewChart.value) {
      echarts.getInstanceByDom(overviewChart.value)?.resize()
    }
  })
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.chart {
  height: 400px;
}

.chart-row {
  margin: 20px 0;
}

.statistic {
  font-size: 24px;
  text-align: center;
}

.statistic .prefix,
.statistic .suffix {
  font-size: 16px;
  color: #909399;
}

.statistic .value {
  margin: 0 4px;
  color: #303133;
}

.statistic.negative .value,
.statistic.negative .prefix {
  color: #F56C6C;
}

.el-table {
  margin-top: 20px;
}
</style> 