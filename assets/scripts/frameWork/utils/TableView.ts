import * as cc from "cc";

/**
 * @desc 初始化
 * @param param 参数字典 
    param.view：所依赖的 cc.ScrollView; 
 * @delegate 代理方法为：

    // 必须实现：cell 尺寸
    cellSizeForTable:(view:ScrollView, index:number)=>Size = null
    // 必须实现：cell 个数
    numberOfCellsInTableView:(view:ScrollView)=>number = null
    // 必须实现：新建 cell 及显示内容填充
    cellAtIndex:(view:ScrollView, index:number)=>Node = null

    // 非必须实现：scrollView 滑动时调用
    scrollViewDidScroll:(view:ScrollView)=>void = null
    // 非必须实现：当cell超出边界被隐藏的时候调用
    cellWillHide:(view:ScrollView,index:number,cell:Node)=>void = null
    // 非必须实现：当cell被显示的时候调用
    cellWillShow:(view:ScrollView,index:number,cell:Node)=>void = null

 */
interface ViewParams {
    view: cc.ScrollView;
    isReused?: boolean;
    /**显示区域多提前进入显示数量 */
    showIndexOffset?: number;
    /**隐藏设置mask大小 */
    hideMaskSize?: boolean;
}

const DirectionType = {
    kHorizontal: 0,
    kVertical: 1,
}

export class TableView {
    public _isCreating: boolean = false;
    public _createdCellMap: {};
    public _recycleQueue: {};
    public _isReload: boolean = false;
    public _isReused: boolean = true;
    public _view: cc.ScrollView;
    public _viewTrans: cc.UITransform;
    public _viewSize: cc.Size = new cc.Size(0, 0);
    public _preInnerContainerSize: cc.Size = null;
    public _innerContainerSize: cc.Size = null;
    public _direction: number = DirectionType.kHorizontal;
    public _countOfItems: number = 0;
    private _vCellsPositions: { [key: number]: number } = {}
    private _maxBounceDistance: number = 0

    /**滑动时cell超出mask外的部分是否使用active false:直接设置 opacity 提高渲染效率 */
    private _isCellUseActive: boolean = false;
    /**显示区域多提前进入显示数量 */
    private _showIndexOffset: number = 0;
    private _hideMaskSize: boolean = false
    /**
     * @notice 必须实现
     * @desc cell 尺寸
     */
    cellSizeForTable: (view: cc.ScrollView, index: number) => cc.Size = null
    /**
     * @notice 必须实现
     * @desc cell 个数
     */
    numberOfCellsInTableView: (view: cc.ScrollView) => number = null
    /**
     * @notice 必须实现
     * @desc cell 创建
     */
    cellAtIndex: (view: cc.ScrollView, index: number) => cc.Node = null
    /**
     * @desc scrollView 滑动
     */
    scrollViewDidScroll: (view: cc.ScrollView) => void = null
    /**
     * @desc cell hide
     */
    cellWillHide: (view: cc.ScrollView, index: number, cell: cc.Node) => void = null
    /**
     * @desc cell show
     */
    cellWillShow: (view: cc.ScrollView, index: number, cell: cc.Node) => void = null
    /**
     * @desc cell move
     */
    cellWillMove: (view: cc.ScrollView, index: number, cell: cc.Node) => void = null

    public constructor(param: ViewParams) {
        this._view = param.view
        if (undefined !== param.isReused) {
            this._isReused = param.isReused;
        }
        if (undefined !== param.showIndexOffset) {
            this._showIndexOffset = param.showIndexOffset;
        }
        if (undefined !== param.hideMaskSize) {
            this._hideMaskSize = param.hideMaskSize;
        }


        this._viewTrans = this._view.node.getComponent(cc.UITransform)
        // let viewNodWidget = this._view.node.getComponent(cc.Widget)
        // viewNodWidget && viewNodWidget.updateAlignment()
        this._viewSize = this._viewTrans.contentSize;

        this._view.node.on("scrolling", this.onEventForCollectionView.bind(this))
        this._direction = this._view.horizontal ? DirectionType.kHorizontal : DirectionType.kVertical
        this._view.content.destroyAllChildren()

        this._view.cancelInnerEvents = false;

        this.addWidgetForView()
        this.initBounceDistance()
    }

    resetViewSize() {
        this._viewSize = cc.size(this._viewTrans.width, this._viewTrans.height);
        this.addWidgetForView()
        this.initBounceDistance()
    }

    onEventForCollectionView() {
        if (!this._isReload) {
            return
        }

        if (this.scrollViewDidScroll) {
            this.scrollViewDidScroll(this._view)
        }
        this.checkUpdateCell(true)
    }

    /**
     * @desc 刷新视图
     * @param positon content 位置
     */
    reloadData(positon?: cc.Vec2, inner?: boolean) {
        this._countOfItems = this.numberOfCellsInTableView(this._view)

        this.updateCellPositions()
        this.updateContentPosition(positon, inner)

        this._isCreating = false

        // --清除当前显示cell
        for (const key in this._createdCellMap) {
            let v = this._createdCellMap[Number(key)]
            if (v instanceof cc.Node && cc.isValid(v)) {
                v.destroy()
            }
        }

        for (const key in this._recycleQueue) {
            let v = this._recycleQueue[Number(key)]
            if (v) {
                for (let index = 0; index < v.length; index++) {
                    let cell = v[index];
                    if (cell instanceof cc.Node && cc.isValid(v)) {
                        cell.destroy()
                    }
                }
            }
        }

        this._recycleQueue = {}
        this._createdCellMap = {}
        this._isReload = true
        this.checkUpdateCell()
    }

    /**
     * @desc 更新 cell 的位置
     */
    private updateCellPositions() {
        let width = 0
        let height = 0

        this._vCellsPositions = {}
        switch (this._direction) {
            case DirectionType.kHorizontal:
                height = this._viewSize.height
                for (let i = 0; i < this._countOfItems; i++) {
                    this._vCellsPositions[i] = width
                    let size = this.cellSizeForTable(this._view, i)
                    width += size.width
                }
                break;
            default:
                width = this._viewSize.width
                for (let i = 0; i < this._countOfItems; i++) {
                    let rowTemp = this._countOfItems - 1 - i
                    this._vCellsPositions[rowTemp] = height
                    let size = this.cellSizeForTable(this._view, rowTemp)
                    height += size.height
                }
                break;
        }
        this._preInnerContainerSize = this._innerContainerSize && this._innerContainerSize || new cc.Size(width, height)
        this._innerContainerSize = new cc.Size(width, height)
    }

    /**
     * @desc 为 scrollview 的遮罩所在的 node 添加 widget，同时根据滑动方向设置 content 的 widget
     */
    private addWidgetForView() {
        let content = this._view.content

        // mask-node
        if (!this._hideMaskSize) {
            let view = content.parent
            let viewTrans = view.getComponent(cc.UITransform);
            viewTrans.setAnchorPoint(new cc.Vec2(0, 0))
            let widgetCom = view.getComponent(cc.Widget) || view.addComponent(cc.Widget)
            widgetCom.isAlignBottom = true
            widgetCom.isAlignLeft = true
            widgetCom.isAlignTop = true
            widgetCom.isAlignRight = true
            widgetCom.top = 0
            widgetCom.bottom = 0
            widgetCom.left = 0
            widgetCom.right = 0
            widgetCom.updateAlignment()
        }

        // content-node
        let contentTrans = content.getComponent(cc.UITransform);
        contentTrans.setAnchorPoint(new cc.Vec2(0, 0))
        content.setPosition(0, 0, 0)
        let widgetCom1 = content.getComponent(cc.Widget) || content.addComponent(cc.Widget)
        if (this._direction == DirectionType.kHorizontal) {
            widgetCom1.top = 0
            widgetCom1.bottom = 0
        } else if (this._direction == DirectionType.kVertical) {
            widgetCom1.left = 0
            widgetCom1.right = 0
        }
        widgetCom1.updateAlignment()
    }

    /**
     * @desc 初始化最大回弹距离
     */
    initBounceDistance() {
        if (this._view.horizontal) {
            this.setMaxBounceDistance(this._viewSize.width / 2)
        } else {
            this.setMaxBounceDistance(this._viewSize.height / 2)
        }
    }

    /**
     * @desc 更新 content 的位置（为了保留在当前滑动位置）
     */
    updateContentPosition(positon?: cc.Vec2, inner?: boolean) {
        this._view.content.getComponent(cc.UITransform).contentSize = this._innerContainerSize

        if (this._direction == DirectionType.kHorizontal) {
            let offset = this._viewSize.width - this._innerContainerSize.width
            let maxPos = 0
            let minPos = offset < 0 ? offset : 0
            let posX = 0
            if (positon) {
                posX = positon.x
            }
            if (posX < minPos) {
                posX = minPos
            } else if (posX > maxPos) {
                posX = maxPos
            }
            this._view.content.setPosition(posX, 0, 0)
        } else {
            let posY = this._viewSize.height - this._innerContainerSize.height
            if (posY < 0) {
                let maxPos = 0
                let minPos = posY
                posY = minPos
                if (positon) {
                    if (inner) {
                        posY = positon.y
                    } else {
                        let size = this._preInnerContainerSize
                        let offsetY = size.height - Math.abs(positon.y)
                        let posY_ = -(this._innerContainerSize.height - offsetY)
                        posY = posY_
                    }
                }
                if (posY <= minPos) {
                    posY = minPos
                } else if (posY >= maxPos) {
                    posY = maxPos
                }
            }

            this._view.content.setPosition(0, posY, 0)
        }
    }

    /* ---
    ---@desc 如果需要复用的话需要通过此方法从缓冲池中获取cell
    ---@param key @ 可以是cell的name,默认"def"
    ---@return */
    dequeueCellByKey(key?: string): cc.Node {
        key = key || "def"
        let queue: [] = this._recycleQueue[key]
        if (queue && queue.length > 0) {
            return queue.pop()
        }
        return null
    }

    /**
     * @desc 获取某行某列的cell
     * @param row 
     * @param col 
     */
    getCellByIndex(index: number) {
        return this._createdCellMap[index]
    }

    /**
     * @desc 获得当前cell数量
     */
    getCountOfCell() {
        let count = this.getCurrentCells().length
        return count
    }

    /**
     * @desc 获取当前界面显示的cell
     */
    getCurrentCells() {
        let cells = []
        for (const key in this._createdCellMap) {
            let v = this._createdCellMap[Number(key)];
            if (v instanceof cc.Node && v.active) {
                cells.push(v)
            }
        }
        return cells
    }

    getContentPosition() {
        return this._view.content.getPosition()
    }

    /**
     * @param refreshCell 强制调用 cellWillShow 来刷新 cell 的显示内容
     */
    setContentPosition(pos: cc.Vec2, refreshCell: boolean = false) {
        this._view.content.setPosition(pos.x, pos.y)

        // 直接设置位置时，不会调用 scrollview 的 scrolling 事件，需手动调用cell刷新
        this.checkUpdateCell(false, refreshCell)
    }

    /*     
    ---@desc 刷新当前界面显示的cell
    ---@param immediately @ 是否立即，否则分帧
    ---@return */
    reFreshCurCells() {
        this.updateCellPositions();
        for (const i in this._createdCellMap) {
            let index = Number(i)
            let v = this._createdCellMap[index];
            if (v instanceof cc.Node) {
                // if (v.activeInHierarchy) {
                //     v.active = false

                let pos = this.getCellPosition(index)
                v.setPosition(pos.x, pos.y)

                if (this._isCellActive(v)) {
                    this._setCellActive(v, false);

                    if (this.cellWillHide) {
                        this.cellWillHide(this._view, index, v)
                    }

                    if (this._isReused) {
                        // 复用加入队列
                        let key = v["cellType"]
                        if (!key) {
                            key = "def"
                        }
                        let queue = this._recycleQueue[key] || []
                        queue.push(v)
                        this._createdCellMap[index] = null
                        this._recycleQueue[key] = queue
                    }

                }
            }
        }


        this.checkUpdateCell()
    }

    /**
     * @desc 检测显示区 cell 的 startIndex、endIndex
     */
    private getStartNEndIndex() {
        if (this._countOfItems == 0) {
            return {
                startIndex: 0,
                endIndex: 0
            }
        }

        let startIndex: number = null
        let endIndex: number = null

        // 水平 
        if (this._direction == DirectionType.kHorizontal) {
            let contentPosX = this._view.getContentPosition().x
            if (contentPosX > 0) {
                startIndex = 0
                for (let i = this._countOfItems - 1; i >= 0; i--) {
                    let posNum = this._vCellsPositions[i]
                    if (endIndex === null && posNum <= this._viewSize.width - contentPosX) {
                        endIndex = i
                        break
                    }
                }
                endIndex += 1
            } else {
                let contentPosXMin = Math.abs(contentPosX)
                let contentPosXMax = contentPosXMin + this._viewSize.width

                for (let i = 0; i < this._countOfItems; i++) {
                    let posNum = this._vCellsPositions[i]
                    let width = this.cellSizeForTable(this._view, i).width
                    if (startIndex === null && posNum + width >= contentPosXMin) {
                        startIndex = i
                        break
                    }
                }
                for (let i = this._countOfItems - 1; i >= 0; i--) {
                    let posNum = this._vCellsPositions[i]
                    if (endIndex === null && posNum <= contentPosXMax) {
                        endIndex = i
                        break
                    }
                }
                if (endIndex === null) {
                    endIndex = startIndex
                }
                endIndex += 1
            }
        } else {
            let contentPosYMin = Math.abs(this._view.getContentPosition().y)
            let contentPosYMax = contentPosYMin + this._viewSize.height
            for (let i = 0; i < this._countOfItems; i++) {
                let posNum = this._vCellsPositions[i]
                if (startIndex === null && posNum <= contentPosYMax) {
                    startIndex = i
                    break
                }
            }

            if (this._innerContainerSize.height <= this._viewSize.height) {
                endIndex = this._countOfItems - 1
            } else {
                for (let i = this._countOfItems - 1; i >= 0; i--) {
                    let posNum = this._vCellsPositions[i]
                    let height = this.cellSizeForTable(this._view, i).height
                    if (endIndex === null && posNum + height >= contentPosYMin) {
                        endIndex = i
                        break
                    }
                }
            }
            if (endIndex === null) {
                endIndex = startIndex
            }
            endIndex += 1
        }

        return {
            startIndex: Math.max(startIndex - this._showIndexOffset, 0),
            endIndex: Math.min(endIndex + this._showIndexOffset, this._countOfItems)
        }
    }

    /**
     * @desc 检测更新显示区cell
     */
    checkUpdateCell(isScrolling: boolean = false, refreshCell: boolean = false) {
        if (!this._isReload) {
            return
        }

        let indexMap = this.getStartNEndIndex()
        let startIndex: number = indexMap.startIndex
        let endIndex: number = indexMap.endIndex

        // log(` startIndex = ${startIndex}, endIndex = ${endIndex}`)

        for (let index = startIndex; index < endIndex; index++) {
            let tempCell = this._createdCellMap[index]
            if (!tempCell) {
                let cell = this.cellAtIndex(this._view, index)
                let cellUItrans = cell.getComponent(cc.UITransform)
                // cell.active = true
                this._setCellActive(cell, true);
                cellUItrans.setAnchorPoint(0, 0);
                let pos = this.getCellPosition(index)

                cell.setPosition(pos.x, pos.y)
                if (!cell.parent) {
                    this._view.content.addChild(cell)
                }

                if (this.cellWillShow) {
                    this.cellWillShow(this._view, index, cell)
                }

                this._createdCellMap[index] = cell
                // } else if (!tempCell.active || (tempCell.active && refreshCell)) {
                //     tempCell.active = true
                //     if (this.cellWillShow) {
                //         this.cellWillShow(this._view, index, tempCell)
                //     }
            } else if (!this._isCellActive(tempCell) || (this._isCellActive(tempCell) && refreshCell)) {
                this._setCellActive(tempCell, true);
                if (this.cellWillShow) {
                    this.cellWillShow(this._view, index, tempCell)
                }
            }

            // if (isScrolling && tempCell instanceof cc.Node && tempCell.active) {
            if (isScrolling && tempCell instanceof cc.Node && this._isCellActive(tempCell)) {
                if (this.cellWillMove) {
                    this.cellWillMove(this._view, index, tempCell)
                }
            }
        }

        // --超出显示区域进行隐藏
        for (let i in this._createdCellMap) {
            let index = Number(i)
            let v = this._createdCellMap[index]
            if (index < startIndex || index > endIndex - 1) {
                if (v instanceof cc.Node) {
                    // if (v.active) {
                    //     v.active = false
                    if (this._isCellActive(v)) {
                        this._setCellActive(v, false);

                        if (this.cellWillHide) {
                            this.cellWillHide(this._view, index, v)
                        }

                        if (this._isReused) {
                            // 复用加入队列
                            let key = v["cellType"]
                            if (!key) {
                                key = "def"
                            }
                            let queue = this._recycleQueue[key] || []
                            queue.push(v)
                            this._createdCellMap[index] = null
                            this._recycleQueue[key] = queue
                        }


                    }
                }
            }
        }
    }

    /**
     * 查看cell当前显示状态
     * @param cell 
     * @returns cell当前是否显示
     */
    private _isCellActive(cell: cc.Node): boolean {
        return cell.active;
    }

    /**
     * 设置cell 显示隐藏
     * @param cell 
     * @param isActive 是否显示
     */
    private _setCellActive(cell: cc.Node, isActive: boolean) {
        cell.active = isActive;
    }

    // 校正位置 
    private getCellPosition(index: number) {
        let posNum = this._vCellsPositions[index]
        switch (this._direction) {
            case DirectionType.kHorizontal:
                return new cc.Vec2(posNum, 0)
            default:
                return new cc.Vec2(0, posNum)
        }
    }

    /**
     * @desc 设置最大回弹距离
     * @param distance 回弹距离
     */
    public setMaxBounceDistance(distance: number) {
        this._view.bounceDuration = distance;
        this._maxBounceDistance = distance
    }

    /**
     * @desc 清除 cell 子节点
     */
    public clearCellChildren() {
        let cells = this.getCurrentCells()
        cells.forEach(cell => {
            cell.destroyAllChildren()
        });
    }

    /**
     * 渐现数据处理
     * @param delay 延迟多少时间开始渐现
     * @param elpase 所有可见cell 全部完成多长时间
     */
    refreshTableView(delay: number, elpase: number) {
        this.reloadData();
        let totalNum = this.numberOfCellsInTableView(this._view);

        let activeNum = 0;
        for (let i = 0; i < totalNum; i++) {
            let cell = this.getCellByIndex(i) as cc.Node;

            if (cell && cell.active) {
                activeNum++;
            }
        }

        activeNum = activeNum || 1;
        let delta = elpase / activeNum;
        for (let i = 0; i < totalNum; i++) {
            let cell = this.getCellByIndex(i) as cc.Node;
            let opacityCom = cell.getComponent(cc.UIOpacity) || cell.addComponent(cc.UIOpacity);
            if (cell && cell.active) {
                cc.Tween.stopAllByTarget(cell);
                cc.tween(opacityCom).set({ opacity: 0, }).delay(delay).to(0.1, { opacity: 255 }).start();
                delay += delta;
            }

        }
    }

    /**
     * @desc 锁定指定的位置
     * @param posInContent 锁定坐标在scrollView.content下的的节点坐标
     */
    public scrollToPos(posInContent: cc.Vec3) {
        if (!this._view) {
            return;
        }
        let contentTrans = this._view.content.getComponent(cc.UITransform)
        let worldPos = contentTrans.convertToWorldSpaceAR(posInContent);
        let screenCenterWorldPos = this._viewTrans.convertToWorldSpaceAR(cc.Vec3.ZERO);
        let posOffset = screenCenterWorldPos.subtract(worldPos);
        let curScrollOffset = this._view.getScrollOffset();
        let targetOffset = curScrollOffset.add(cc.v2(posOffset.x, posOffset.y))
        this._view.scrollToOffset(cc.v2(-targetOffset.x, targetOffset.y), 0.1);
    }

}
