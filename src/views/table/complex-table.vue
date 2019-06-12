<template>
  <div class="put-in-history-component">
    <el-card shadow="hover">
      <el-form
        ref="historyForm"
        :model="historyForm"
        :inline="true"
        status-icon
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="投放课程"
              prop="memberLabelId"
            >
              <el-select
                v-model="historyForm.memberLabelId"
                clearable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in memberLabels"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="投放时间"
              prop="publishTime"
            >
              <el-date-picker
                v-model="historyForm.publishTime"
                type="daterange"
                value-format="timestamp"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="公众号搜索"
              prop="kolAccountName"
            >
              <el-input
                v-model="historyForm.kolAccountName"
                clearable
                placeholder="请输入公众号名字"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button
                type="primary"
                @click="submitQuery"
              >查询</el-button>
              <el-button
                type="primary"
                plain
                @click="addCode"
              >新增渠道二维码</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card shadow="hover">
      <el-table
        :data="tableData"
        align="center"
        style="width: 100%"
      >
        <el-table-column
          label="投放课程"
          fixed
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.memberLabelIdStr }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="投放公众号"
          align="center"
        >
          <template slot-scope="scope">
            <el-popover
              trigger="hover"
              placement="top"
            >
              <p>投放公众号: {{ `${scope.row.kolAccountTypeStr}类：${scope.row.kolAccountName}` }}</p>
              <div
                slot="reference"
                class="name-wrapper"
              >
                <el-tag
                  class="channel-source"
                  size="medium"
                >{{ scope.row.kolAccountName }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="渠道码"
          align="center"
        >
          <template slot-scope="scope">
            <el-popover
              trigger="hover"
              placement="top"
            >
              <p>渠道码: {{ scope.row.channelSource }}</p>
              <div
                slot="reference"
                class="name-wrapper"
              >

                <el-tag
                  class="channel-source"
                  data-clipboard-action="copy"
                  :data-clipboard-text="scope.row.channelSource"
                  size="medium"
                  @click.native="copyChannel"
                >{{ scope.row.channelSource }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          label="投放时间"
          align="left"
          width="250"
        >
          <template slot-scope="scope">
            <div>预计投放:<i class="el-icon-time" /><span class="green-tip">{{ scope.row.publishTime }}</span> </div>
            <div>首次到客:<i class="el-icon-time" /> <span class="green-tip">{{ scope.row.firstComeTime }}</span></div>
            <div>最新到客:<i class="el-icon-time" /> <span class="green-tip">{{ scope.row.lastComeTime }}</span></div>
          </template>
        </el-table-column>
        <el-table-column label="到客情况">
          <template slot-scope="scope">
            <div>预计到客人数: {{ scope.row.predictAmount }}</div>
            <div>实际到客人数: {{ scope.row.comeMembers }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="流量分布"
          align="center"
        >
          <template slot-scope="scope">
            <el-link
              style="color:#7DBE00;cursor:pointer"
              @click="viewTeacherList(scope.row.flowTeachers,scope.row.kolAccountTypeStr)"
            >查看班主任列表<i class="el-icon-view el-icon--right" /> </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              :disabled="!scope.row.isEdit"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <br>
            <br>
            <el-button
              size="mini"
              type="primary"
              @click="analysisChannel(scope.row)"
            >分析</el-button>
            <br>
            <br>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.channelLabelId)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <br>
      <!-- 分页 -->
      <el-pagination
        v-show="!!tableData&&tableData.length"
        :hide-on-single-page="pageInfo.total&&pageInfo.total===1"
        :current-page.sync="pageInfo.page"
        :page-size="20"
        layout="prev, pager, next, jumper"
        :total="pageInfo.total"
        @current-change="loadCurrentChange"
      />
    </el-card>
    <!-- 查看班主任 -->
    <el-dialog
      :title="`${kolAccountTypeStr}投放流量分布`"
      :visible.sync="viewTeacher"
      width="60%"
      :before-close="viewTeacher"
    >
      <el-table :data="flowTeachers">
        <el-table-column
          property="teacherName"
          label="班主任"
          width="250"
        />
        <el-table-column
          property="comeTimeRange"
          label="到客周期"
          width="350"
        />
        <el-table-column
          property="comeCount"
          label="公众号到客"
        />
      </el-table>
    </el-dialog>
    <!-- 渠道分析 -->
    <el-dialog
      :title="`公众号：${kolAccountTypeStr}渠道分析`"
      :visible.sync="viewSourceAnalysis"
      width="30%"
      center
    >
      <el-input
        v-model="channelAnalysis"
        type="textarea"
        :rows="2"
        placeholder="请输入内容"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >

        <el-button
          type="primary"
          @click="setChannelAnalysis"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 新增渠道二维码module -->
    <el-dialog
      :title="editStatus ? '新增投放二维码':'编辑渠道二维码'"
      :visible.sync="outerVisible"
    >
      <el-dialog
        width="50%"
        title="生成二维码成功"
        :visible.sync="innerVisible"
        append-to-body
      >
        <el-card class="box-card add-sucess-info-wrap">
          <el-row>
            <span class="info-title">公众号类型：</span>
            <el-tag type="success">{{ addSuccessInfo.kolAccountTypeStr }}</el-tag>
          </el-row>
          <el-row>
            <span class="info-title">投放公众号：</span>
            <el-tag type="success">{{ addSuccessInfo.kolAccountName }}</el-tag>
          </el-row>
          <el-row>
            <span class="info-title">投放课程：</span>
            <el-tag type="success">{{ addSuccessInfo.memberLabelIdStr }}</el-tag>
          </el-row>
          <el-row>
            <span class="info-title">投放文案：</span>
            <el-tag type="success">{{ addSuccessInfo.advertTypeStr }}</el-tag>
          </el-row>
          <el-row>
            <span class="info-title">渠道码：</span>
            <el-tag type="success">{{ addSuccessInfo.source }}</el-tag>
          </el-row>

          <el-row>
            <span class="info-title">投放二维码：</span><img
              style="width: 100px; height: 100px"
              :src="addSuccessInfo.flowQrCode"
              :fit="'cover'"
            >
          </el-row>
        </el-card>
        <div
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="viewingHistory">查看投放历史</el-button>
          <el-button
            type="primary"
            @click="createContinue"
          >继续创建</el-button>
        </div>
      </el-dialog>
      <el-form
        ref="addCodeForm"
        :model="addCodeForm"
        :inline="false"
        status-icon
        style="width:70%;margin:auto"
        label-width="120px"
        :rules="addCodeRules"
      >
        <el-form-item
          label="投放课程"
          prop="memberLabelId"
        >
          <el-select
            v-model="addCodeForm.memberLabelId"
            clearable
            class="input-width"
            :disabled="!editStatus"
            placeholder="请选择"
          >
            <el-option
              v-for="item in memberLabels"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="公众号类型"
          prop="kolAccountType"
        >
          <el-select
            v-model="addCodeForm.kolAccountType"
            clearable
            class="input-width"
            placeholder="请选择"
          >
            <el-option
              v-for="item in kolAccountTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="投放公众号"
          prop="kolAccountName"
        >
          <el-input
            v-model="addCodeForm.kolAccountName"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="投放文案"
          prop="advertType"
        >
          <el-select
            v-model="addCodeForm.advertType"
            clearable
            class="input-width"
            placeholder="请选择"
          >
            <el-option
              v-for="item in advertTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="获客公众号"
          prop="weChatServiceId"
        >
          <el-select
            v-model="addCodeForm.weChatServiceId"
            clearable
            class="input-width"
            placeholder="请选择"
          >
            <el-option
              v-for="item in weChatServiceTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="计划投放时间"
          prop="publishTime"
        >
          <el-date-picker
            v-model="addCodeForm.publishTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%; max-width:250px"
            type="datetime"
            placeholder="选择日期时间"
          />
        </el-form-item>
        <el-form-item
          label="预计到客人数"
          prop="predictAmount"
        >
          <el-input
            v-model="addCodeForm.predictAmount"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="display:none"
          prop="channelLabelId"
        />
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="outerVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submitGenerate('addCodeForm')"
        >{{ editStatus? "生成二维码":"重新生成" }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { loadSelectInfo, saveGenerate, loadPageList, channelAnalysisList, deleteIt } from '@/api/putin'
import ClipboardJS from 'clipboard'
export default {
  name: 'PutInHistory',
  data() {
    return {
      historyForm: {
        memberLabelId: '',
        publishTime: [],
        kolAccountName: ''
      },
      // historyRules: {
      //   memberLabelId: { required: true, message: '请选择投放课程', trigger: 'change' },
      //   publishTime: { required: true, message: '请选择投放时间', trigger: 'change' },
      //   kolAccountName: { required: true, message: '请输入公众号', trigger: 'change' }
      // },
      addCodeForm: {
        channelLabelId: '',
        memberLabelId: '', // 投放课程
        kolAccountType: '', // 公众号类型
        kolAccountName: '', // 投放公众号
        advertType: '', // 投放文案
        weChatServiceId: '',
        publishTime: '',
        predictAmount: ''

      },
      addCodeRules: {
        memberLabelId: { required: true, message: '请选择投放课程', trigger: 'change' },
        kolAccountType: { required: true, message: '请选择公众号类型', trigger: 'change' },
        kolAccountName: { required: true, message: '请输入投放公众号', trigger: 'change' },
        advertType: { required: true, message: '请选择投放文案', trigger: 'change' },
        weChatServiceId: { required: true, message: '请选择获客公众号', trigger: 'change' },
        publishTime: { required: true, message: '请选择投放时间', trigger: 'change' },
        predictAmount: { required: true, message: '请输入预估人数', trigger: 'change' }
      },
      editStatus: true,
      outerVisible: false,
      innerVisible: false,
      viewTeacher: false,
      viewSourceAnalysis: false,
      addSuccessInfo: {
        kolAccountTypeStr: '',
        kolAccountName: '',
        memberLabelIdStr: '',
        advertTypeStr: '',
        source: '',
        weChatServiceId: '',
        flowQrCode: ''
      },
      advertTypes: [], // 文案类型
      kolAccountTypes: [], // sh
      memberLabels: [], // 课程类型
      weChatServiceTypes: [],
      pageInfo: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      tableData: [
      ],
      flowTeachers: {},
      kolAccountTypeStr: '',
      channelAnalysis: '',
      id: '',
      ClipboardJS: ''
    }
  },
  mounted() {
    // this.loadCurrentChange()
    this.loadInfo()
  },
  methods: {
    async loadInfo() {
      const res = await loadSelectInfo()
      alert(res)
      if (res.code && res.code === 200) {
        alert(1)
        const { weChatServiceTypes, memberLabels, kolAccountTypes, advertTypes } = res.msg
        this.weChatServiceTypes = weChatServiceTypes
        this.memberLabels = memberLabels
        this.kolAccountTypes = kolAccountTypes
        this.advertTypes = advertTypes
      }
    },
    submitQuery() {
      this.loadCurrentChange()
    },
    submitGenerate(formName) { // 生成二维码
      this.$refs[formName].validate((valid) => {
        if (!valid) return
        const {
          channelLabelId = '',
          memberLabelId,
          kolAccountType,
          kolAccountName,
          advertType,
          weChatServiceId,
          publishTime,
          predictAmount
        } = this.addCodeForm
        const data = {
          channelLabelId,
          memberLabelId,
          kolAccountType,
          kolAccountName,
          advertType,
          weChatServiceId,
          publishTime,
          predictAmount
        }
        const res = saveGenerate(data)
        if (res.code && res.code === 200) {
          this.addSuccessInfo = res.msg
          this.innerVisible = true
          this.loadCurrentChange()
        }
      })
    },
    viewingHistory() {
      this.outerVisible = false
      this.innerVisible = false
      this.$refs['addCodeForm'].resetFields()
    },
    viewTeacherList(flowTeachers, kolAccountTypeStr) {
      this.flowTeachers = flowTeachers
      this.kolAccountTypeStr = kolAccountTypeStr
      this.viewTeacher = true
    },
    analysisChannel(row) {
      const { kolAccountTypeStr, channelAnalysis = '', channelLabelId: id } = row
      this.id = id
      this.channelAnalysis = channelAnalysis
      this.viewSourceAnalysis = true
      this.kolAccountTypeStr = kolAccountTypeStr
    },
    createContinue() {
      this.innerVisible = false
      this.editStatus = false
      this.addCode()
    },
    addCode() { // 新增渠道二维码
      console.log('add')
      console.log(!this.editStatus)
      this.addCodeForm = {}
      !this.editStatus && this.$refs['addCodeForm'].resetFields()
      this.outerVisible = true
      this.editStatus = true
    },
    handleEdit(row) { // 编辑渠道二维码
      const {
        advertType,
        channelLabelId = '',
        kolAccountName,
        kolAccountType,
        memberLabelId,
        predictAmount,
        publishTime,
        weChatServiceId } = row
      this.addCodeForm = {
        advertType,
        channelLabelId,
        kolAccountName,
        kolAccountType,
        memberLabelId,
        predictAmount,
        publishTime,
        weChatServiceId
      }
      this.outerVisible = true
      this.editStatus = false
    },
    setChannelAnalysis() {
      const { id, channelAnalysis } = this
      if (!channelAnalysis) {
        return this.$message({
          message: '分析内容不能为空',
          type: 'warning'
        })
      }

      const data = {
        id, channelAnalysis
      }
      const res = channelAnalysisList(data)
      if (res.code && res.code === 200) {
        this.loadCurrentChange()
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        this.viewSourceAnalysis = false
      }
    }
  },
  loadCurrentChange(page) { // 加载分页
    console.log(page, 'ppppp')
    const { kolAccountName, publishTime, memberLabelId } = this.historyForm
    const [publishTimeStart, publishTimeEnd] = publishTime
    const data = {
      page: page || this.pageInfo.page,
      publishTimeStart,
      publishTimeEnd,
      kolAccountName,
      memberLabelId
    }
    const res = loadPageList(data)
    if (res.code && res.code === 200) {
      const { list, page } = res.msg
      this.pageInfo = page
      this.tableData = list
    }
  },
  copyChannel(e) {
    this.clipboard = new ClipboardJS(e.target)
    this.$nextTick(function() {
      this.clipboard.on('success', (e) => {
        this.$message({
          message: '复制成功',
          type: 'success'
        })
        console.log('success')
        this.clipboard.destroy()
      })
      this.clipboard.on('error', (e) => {
        console.log('error')
        this.$message({
          message: '复制失败',
          type: 'error'
        })
        this.clipboard.destroy()
      })
    })

    // obj.value = e.target.textContent
    // console.log(obj)
    // obj.select()
    // document.execCommand('Copy')
    // console.log('复制完成')
  },
  handleDelete(channelLabelId) { // 删除
    this.$confirm('此操作将永久删除本条记录, 是否继续?', '温馨提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const data = { channelLabelId }
      const res = deleteIt(data)
      if (res.code && res.code === 200) {
        this.$message({
          type: 'success',
          message: '您已成功成功删除'
        })
        this.loadCurrentChange()
      }
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消删除'
      })
    })
  }
}

</script>

